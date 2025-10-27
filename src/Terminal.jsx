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

  // Helper function to format colored text
  const colorize = (text, color = 'cyan') => {
    return `[${color.toUpperCase()}]${text}[/${color.toUpperCase()}]`;
  };

  // Parse colored text markers and convert to styled spans
  const parseColoredText = (text) => {
    const colorMap = {
      'CYAN': '#4ec9b0',
      'GREEN': '#4ec9b0',
      'BLUE': '#4ec9b0',
      'YELLOW': '#dcdcaa',
      'MAGENTA': '#c586c0',
      'ORANGE': '#ff8c69',
      'CORAL': '#ff6b6b',
      'PEACH': '#ce9178',
      'SALMON': '#fa8072',
      'HOTPINK': '#ff5588',  // Lighter, more red-toned pink for dark background
      'LIGHTPINK': '#ff66b2',  // Lighter pink
      'LIGHTERPINK': '#ff80bf',  // Even lighter pink
      'PASTELPINK': '#ff99cc',  // Very light/pastel pink
      'BRIGHTORANGE': '#ff8000',  // Bright orange
    };

    let result = text;
    Object.entries(colorMap).forEach(([colorName, colorCode]) => {
      const regex = new RegExp(`\\[${colorName}\\](.*?)\\[\\/${colorName}\\]`, 'g');
      result = result.replace(regex, `<span style="color: ${colorCode}; font-weight: bold;">$1</span>`);
    });

    return result;
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
    const bannerWidth = 60;
    const banner = '━'.repeat(bannerWidth);
    const padding = Math.floor((bannerWidth - about.greeting.length) / 2);
    const centeredTitle = ' '.repeat(padding) + colorize(about.greeting, 'hotpink');
    const output = `
${banner}
${centeredTitle}
${banner}

${about.description}
`;
    addToHistory(output, 'colored');
  };

  const showExperience = () => {
    const title = 'Work Experience';
    const bannerWidth = 60;
    const banner = '━'.repeat(bannerWidth);
    const padding = Math.floor((bannerWidth - title.length) / 2);
    const centeredTitle = ' '.repeat(padding) + colorize(title, 'hotpink');
    let output = '\n' + banner + '\n' + centeredTitle + '\n' + banner + '\n\n';

    config.experience.forEach((exp, index) => {
      output += colorize(`${exp.title}`, 'brightorange') + ` @ ${exp.company}\n`;
      output += `${exp.period}\n\n`;
      exp.description.forEach(item => {
        output += `  • ${item}\n`;
      });
      if (index < config.experience.length - 1) output += '\n';
    });

    addToHistory(output, 'colored');
  };

  const showProjects = () => {
    const title = 'Projects';
    const bannerWidth = 60;
    const banner = '━'.repeat(bannerWidth);
    const padding = Math.floor((bannerWidth - title.length) / 2);
    const centeredTitle = ' '.repeat(padding) + colorize(title, 'hotpink');
    let output = '\n' + banner + '\n' + centeredTitle + '\n' + banner + '\n\n';

    config.projects.forEach((project, index) => {
      output += colorize(project.name, 'brightorange') + '\n';
      if (project.period) output += `${project.period}\n`;
      output += `${project.description}\n`;
      output += `Technologies: ${project.technologies.join(', ')}\n`;
      if (project.github) output += `GitHub: ${project.github}\n`;
      if (index < config.projects.length - 1) output += '\n';
    });

    addToHistory(output, 'colored');
  };

  const showSkills = () => {
    const { skills } = config;
    const title = 'Technical Skills';
    const bannerWidth = 60;
    const banner = '━'.repeat(bannerWidth);
    const padding = Math.floor((bannerWidth - title.length) / 2);
    const centeredTitle = ' '.repeat(padding) + colorize(title, 'hotpink');
    let output = '\n' + banner + '\n' + centeredTitle + '\n' + banner + '\n\n';

    output += colorize('Programming Languages:', 'brightorange') + '\n  ' + skills.languages.join(', ') + '\n\n';
    output += colorize('ML & Data Science:', 'brightorange') + '\n  ' + skills.ml_data_science.join(', ') + '\n\n';
    output += colorize('Cloud & Backend:', 'brightorange') + '\n  ' + skills.cloud_backend.join(', ') + '\n\n';
    output += colorize('Hardware:', 'brightorange') + '\n  ' + skills.hardware.join(', ') + '\n\n';
    output += colorize('Interests:', 'brightorange') + '\n  ' + skills.interests.join(', ') + '\n';

    addToHistory(output, 'colored');
  };

  const showContact = () => {
    const { personal } = config;
    const title = 'Get in Touch';
    const bannerWidth = 60;
    const banner = '━'.repeat(bannerWidth);
    const padding = Math.floor((bannerWidth - title.length) / 2);
    const centeredTitle = ' '.repeat(padding) + colorize(title, 'hotpink');
    const output = `
${banner}
${centeredTitle}
${banner}

${colorize('Email:', 'brightorange')}    ${personal.email}
${colorize('GitHub:', 'brightorange')}   ${personal.github}
${colorize('LinkedIn:', 'brightorange')} ${personal.linkedin}

Feel free to reach out!
`;
    addToHistory(output, 'colored');
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
            {item.type === 'colored' ? (
              <pre dangerouslySetInnerHTML={{ __html: parseColoredText(item.content) }} />
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
