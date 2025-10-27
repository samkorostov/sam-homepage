import { useState, useEffect, useRef } from 'react';
import yaml from 'js-yaml';
import './Terminal.css';

const Terminal = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [config, setConfig] = useState(null);
  const inputRef = useRef(null);
  const terminalRef = useRef(null);
  const hasLoadedRef = useRef(false);

  // Available commands
  const commands = ['about', 'experience', 'projects', 'skills', 'help', 'clear', 'contact'];

  // Load config on mount
  useEffect(() => {
    if (hasLoadedRef.current) return; // Prevent double loading in StrictMode
    hasLoadedRef.current = true;

    fetch(`${import.meta.env.BASE_URL}config.yaml`)
      .then(res => res.text())
      .then(text => {
        const data = yaml.load(text);
        setConfig(data);
        // Show welcome banner
        showBanner(data.personal);
      })
      .catch(err => {
        console.error('Failed to load config:', err);
        addToHistory('Error loading configuration file.');
      });
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  // Focus input on mount and click
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const showBanner = (personal) => {
    const banner = `
  ███████╗ █████╗ ███╗   ███╗    ██╗  ██╗ ██████╗ ██████╗  ██████╗ ███████╗████████╗ ██████╗ ██╗   ██╗
  ██╔════╝██╔══██╗████╗ ████║    ██║ ██╔╝██╔═══██╗██╔══██╗██╔═══██╗██╔════╝╚══██╔══╝██╔═══██╗██║   ██║
  ███████╗███████║██╔████╔██║    █████╔╝ ██║   ██║██████╔╝██║   ██║███████╗   ██║   ██║   ██║██║   ██║
  ╚════██║██╔══██║██║╚██╔╝██║    ██╔═██╗ ██║   ██║██╔══██╗██║   ██║╚════██║   ██║   ██║   ██║╚██╗ ██╔╝
  ███████║██║  ██║██║ ╚═╝ ██║    ██║  ██╗╚██████╔╝██║  ██║╚██████╔╝███████║   ██║   ╚██████╔╝ ╚████╔╝
  ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝    ╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝    ╚═════╝   ╚═══╝

  ${personal.title}
  ${personal.education}

  Type 'help' to see available commands.
`;
    addToHistory(banner, 'banner');
  };

  const addToHistory = (output, type = 'output') => {
    setHistory(prev => [...prev, { type, content: output }]);
  };

  const handleCommand = (cmd) => {
    const trimmedCmd = cmd.trim().toLowerCase();

    if (!trimmedCmd) return;

    // Add command to history
    addToHistory(`${getPrompt()}${cmd}`, 'command');
    setCommandHistory(prev => [...prev, cmd]);
    setHistoryIndex(-1);

    if (!config) {
      addToHistory('Configuration not loaded yet. Please wait...');
      return;
    }

    switch (trimmedCmd) {
      case 'help':
        showHelp();
        break;
      case 'about':
        showAbout();
        break;
      case 'experience':
        showExperience();
        break;
      case 'projects':
        showProjects();
        break;
      case 'skills':
        showSkills();
        break;
      case 'contact':
        showContact();
        break;
      case 'clear':
        setHistory([]);
        showBanner(config.personal);
        break;
      default:
        addToHistory(`Command not found: ${trimmedCmd}. Type 'help' for available commands.`);
    }
  };

  const showHelp = () => {
    const helpText = `
Available commands:

  about       - Learn more about me
  experience  - View my work experience
  projects    - See my projects
  skills      - Check out my technical skills
  contact     - Get in touch with me
  clear       - Clear the terminal
  help        - Show this help message

Tip: Use Tab for autocomplete and Arrow keys for command history!
`;
    addToHistory(helpText);
  };

  const showAbout = () => {
    const { about } = config;
    const output = `
${about.greeting}
${'='.repeat(about.greeting.length)}

${about.description}
`;
    addToHistory(output);
  };

  const showExperience = () => {
    let output = '\nWork Experience\n' + '='.repeat(15) + '\n\n';

    config.experience.forEach((exp, index) => {
      output += `${exp.title} @ ${exp.company}\n`;
      output += `${exp.period}\n\n`;
      exp.description.forEach(item => {
        output += `  • ${item}\n`;
      });
      if (index < config.experience.length - 1) output += '\n';
    });

    addToHistory(output);
  };

  const showProjects = () => {
    let output = '\nProjects\n' + '='.repeat(8) + '\n\n';

    config.projects.forEach((project, index) => {
      output += `${project.name}\n`;
      if (project.period) output += `${project.period}\n`;
      output += `${project.description}\n`;
      output += `Technologies: ${project.technologies.join(', ')}\n`;
      if (project.github) output += `GitHub: ${project.github}\n`;
      if (index < config.projects.length - 1) output += '\n';
    });

    addToHistory(output);
  };

  const showSkills = () => {
    const { skills } = config;
    let output = '\nTechnical Skills\n' + '='.repeat(16) + '\n\n';

    output += 'Programming Languages:\n  ' + skills.languages.join(', ') + '\n\n';
    output += 'ML & Data Science:\n  ' + skills.ml_data_science.join(', ') + '\n\n';
    output += 'Cloud & Backend:\n  ' + skills.cloud_backend.join(', ') + '\n\n';
    output += 'Hardware:\n  ' + skills.hardware.join(', ') + '\n\n';
    output += 'Interests:\n  ' + skills.interests.join(', ') + '\n';

    addToHistory(output);
  };

  const showContact = () => {
    const { personal } = config;
    const output = `
Get in Touch
${'='.repeat(12)}

Email:    ${personal.email}
GitHub:   ${personal.github}
LinkedIn: ${personal.linkedin}

Feel free to reach out!
`;
    addToHistory(output);
  };

  const getPrompt = () => {
    return config ? `${config.personal.name.split(' ')[0].toLowerCase()}@portfolio ~ % ` : 'guest@portfolio ~ % ';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1
          ? commandHistory.length - 1
          : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleAutocomplete();
    }
  };

  const handleAutocomplete = () => {
    if (!input.trim()) return;

    const matches = commands.filter(cmd => cmd.startsWith(input.toLowerCase()));

    if (matches.length === 1) {
      setInput(matches[0]);
    } else if (matches.length > 1) {
      addToHistory(`${getPrompt()}${input}`, 'command');
      addToHistory(matches.join('  '));
    }
  };

  return (
    <div className="terminal-container" onClick={() => inputRef.current?.focus()}>
      <div className="terminal-header">
        <div className="terminal-buttons">
          <span className="btn close"></span>
          <span className="btn minimize"></span>
          <span className="btn maximize"></span>
        </div>
        <div className="terminal-title">sam@portfolio: ~</div>
      </div>

      <div className="terminal-body" ref={terminalRef}>
        {history.map((item, index) => (
          <div key={index} className={`terminal-line ${item.type}`}>
            {item.type === 'banner' ? (
              <pre>{item.content}</pre>
            ) : (
              <pre>{item.content}</pre>
            )}
          </div>
        ))}

        <div className="terminal-input-line">
          <span className="terminal-prompt">{getPrompt()}</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="terminal-input"
            spellCheck="false"
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
};

export default Terminal;
