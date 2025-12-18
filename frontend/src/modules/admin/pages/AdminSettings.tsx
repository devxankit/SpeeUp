import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminSettings() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to payment list page (first settings page)
    navigate('/admin/payment-list', { replace: true });
  }, [navigate]);

  return null;
}

