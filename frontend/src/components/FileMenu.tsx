import React, { useState, useEffect, useRef } from 'react';
import './FileMenu.css';
import { getSpreadsheetsAPI } from '../services/api'; // Import the API function

type ExportFormat = 'csv' | 'xlsx' | 'pdf' | 'html';

// Define the shape of a recent file object
interface RecentFile {
  _id: string;
  fileName: string;
}

interface FileMenuProps {
  onNew: () => void;
  onOpen: () => void;
  onExport: (format: ExportFormat) => void;
  onRecentFileSelect: (fileId: string) => void; // New prop for handling clicks
}

const FileMenu: React.FC<FileMenuProps> = ({ onNew, onOpen, onExport, onRecentFileSelect }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExportSubMenuOpen, setIsExportSubMenuOpen] = useState(false);
  const [isRecentSubMenuOpen, setIsRecentSubMenuOpen] = useState(false); // State for the new submenu

  // State for the list of files and loading status
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch recent files when the menu is opened
  const handleMenuToggle = async () => {
    const openingMenu = !isMenuOpen;
    setIsMenuOpen(openingMenu);

    if (openingMenu) {
      setIsLoading(true);
      try {
        const response = await getSpreadsheetsAPI();
        setRecentFiles(response.data);
      } catch (error) {
        console.error("Failed to fetch recent files", error);
        setRecentFiles([]); // Clear on error
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleAction = (action: () => void) => {
    action();
    setIsMenuOpen(false); // Close all menus after an action
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

          {/* --- NEW RECENT FILES SUBMENU --- */}
          <div
            className="dropdown-item has-submenu"
            onMouseEnter={() => setIsRecentSubMenuOpen(true)}
            onMouseLeave={() => setIsRecentSubMenuOpen(false)}
          >
            Recent Files
            <span className="submenu-arrow">▶</span>
            {isRecentSubMenuOpen && (
              <div className="submenu">
                {isLoading ? (
                  <div className="dropdown-item-static">Loading...</div>
                ) : recentFiles.length > 0 ? (
                  recentFiles.map(file => (
                    <div
                      key={file._id}
                      className="dropdown-item"
                      onClick={() => handleAction(() => onRecentFileSelect(file._id))}
                    >
                      {file.fileName}
                    </div>
                  ))
                ) : (
                  <div className="dropdown-item-static">No recent files</div>
                )}
              </div>
            )}
          </div>

          {/* Export Submenu (no changes) */}
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