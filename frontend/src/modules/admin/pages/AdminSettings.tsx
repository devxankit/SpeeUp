import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminSettings() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to store setting page
    navigate('/admin/store-setting', { replace: true });
  }, [navigate]);

  return null;
}

