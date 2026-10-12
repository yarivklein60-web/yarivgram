import { Link } from 'react-router-dom';

export default function PageNotFound() {
  return (
    <div className="text-center py-24">
      <div className="text-6xl mb-4">🤷</div>
      <h1 className="text-2xl font-bold mb-2">העמוד לא נמצא</h1>
      <Link to="/" className="btn-primary inline-block mt-4">
        חזרה לבית
      </Link>
    </div>
  );
}
