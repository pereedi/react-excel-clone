import React, { useState, useEffect, useRef } from 'react';
import './FileMenu.css'; // We'll create this CSS file next

type ExportFormat = 'csv' | 'xlsx' | 'pdf' | 'html';

interface FileMenuProps {
  onNew: () => void;
  onOpen: () => void;
  onExport: (format: ExportFormat) => void;
}

const FileMenu: React.FC<FileMenuProps> = ({ onNew, onOpen, onExport }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExportSubMenuOpen, setIsExportSubMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
        setIsExportSubMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAction = (action: () => void) => {
    action();
    setIsMenuOpen(false);
    setIsExportSubMenuOpen(false);
  };

  return (
    <div className="file-menu" ref={menuRef}>
      <div className="menu-item" onClick={handleMenuToggle}>
        File
      </div>

      {isMenuOpen && (
        <div className="dropdown-menu">
          <div className="dropdown-item" onClick={() => handleAction(onNew)}>
            New File
          </div>
          <div className="dropdown-item" onClick={() => handleAction(onOpen)}>
            Open / Import...
          </div>
          <div
            className="dropdown-item has-submenu"
            onMouseEnter={() => setIsExportSubMenuOpen(true)}
            onMouseLeave={() => setIsExportSubMenuOpen(false)}
          >
            Export as
            <span className="submenu-arrow">▶</span>
            {isExportSubMenuOpen && (
              <div className="submenu">
                <div className="dropdown-item" onClick={() => handleAction(() => onExport('csv'))}>
                  CSV (.csv)
                </div>
                <div className="dropdown-item" onClick={() => handleAction(() => onExport('xlsx'))}>
                  Excel (.xlsx / .ods)
                </div>
                <div className="dropdown-item" onClick={() => handleAction(() => onExport('pdf'))}>
                  PDF Document (.pdf)
                </div>
                <div className="dropdown-item" onClick={() => handleAction(() => onExport('html'))}>
                  Web Page (.html)
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileMenu;