import { useState, useEffect, useCallback } from 'react';

export function useDropzone() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'active'
  const [activeDrops, setActiveDrops] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [latestDrop, setLatestDrop] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isDraggingGlobal, setIsDraggingGlobal] = useState(false);
  const [stagedFile, setStagedFile] = useState(null);

  const fetchActiveDrops = useCallback(async () => {
    try {
      const res = await fetch('/api/drop');
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.drops)) {
        setActiveDrops(data.drops);
      }
    } catch (err) {
      console.error('Failed to fetch active drops:', err);
    }
  }, []);

  // Fetch active drops when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchActiveDrops();
    }
  }, [isOpen, fetchActiveDrops]);

  // Global window drag detection (Desktop enhancement)
  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e) => {
      e.preventDefault();
      dragCounter++;
      if (e.dataTransfer.types && Array.from(e.dataTransfer.types).includes('Files')) {
        setIsDraggingGlobal(true);
      }
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        setIsDraggingGlobal(false);
        dragCounter = 0;
      }
    };

    const handleDragOver = (e) => {
      e.preventDefault();
    };

    const handleDrop = (e) => {
      e.preventDefault();
      dragCounter = 0;
      setIsDraggingGlobal(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        setStagedFile(e.dataTransfer.files[0]);
        setIsOpen(true);
        setActiveTab('upload');
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, []);

  const openDropzone = (tab = 'upload') => {
    setActiveTab(tab);
    setIsOpen(true);
  };

  const closeDropzone = () => {
    setIsOpen(false);
    setUploadError(null);
  };

  const resetUpload = () => {
    setIsUploading(false);
    setUploadProgress(0);
    setLatestDrop(null);
    setUploadError(null);
    setStagedFile(null);
  };

  const uploadFile = async (file, options = { ttlMinutes: 1440, oneTime: false, password: '' }) => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setLatestDrop(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('ttl', String(options.ttlMinutes || 1440));
    formData.append('oneTime', String(!!options.oneTime));
    if (options.password && options.password.trim()) {
      formData.append('password', options.password.trim());
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/drop');

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        setIsUploading(false);
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            // Construct absolute URL for Funnel / LAN sharing
            const origin = window.location.origin;
            const fullUrl = `${origin}${data.downloadUrl}`;
            const dropWithFullUrl = { ...data, fullUrl };
            setLatestDrop(dropWithFullUrl);
            fetchActiveDrops();
            resolve(dropWithFullUrl);
          } catch (err) {
            setUploadError('Invalid server response');
            reject(err);
          }
        } else {
          setUploadError(`Upload failed (HTTP ${xhr.status})`);
          reject(new Error(`HTTP ${xhr.status}`));
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        setUploadError('Network error during upload');
        reject(new Error('Network error'));
      };

      xhr.send(formData);
    });
  };

  const deleteDrop = async (id) => {
    try {
      const res = await fetch(`/api/drop/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setActiveDrops((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete drop:', err);
    }
  };

  return {
    isOpen,
    activeTab,
    setActiveTab,
    activeDrops,
    isUploading,
    uploadProgress,
    latestDrop,
    uploadError,
    isDraggingGlobal,
    stagedFile,
    setStagedFile,
    openDropzone,
    closeDropzone,
    resetUpload,
    uploadFile,
    deleteDrop,
    fetchActiveDrops,
  };
}
