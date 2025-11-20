// src/pages/PrivacyPolicy.tsx
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/context/useAuth'; // ✅ Updated import path
import { deleteUser } from 'firebase/auth';
import { doc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import toast from 'react-hot-toast';

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ Changed from currentUser to user
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [showDeleteSection, setShowDeleteSection] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) { // ✅ Changed from currentUser to user
      toast.error('You must be logged in to delete your account');
      return;
    }

    if (confirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    if (!window.confirm('Are you absolutely sure? This cannot be undone!')) {
      return;
    }

    setLoading(true);
    try {
      // Delete user's dogs
      const dogsQuery = query(
        collection(db, 'dogs'),
        where('ownerId', '==', user.uid) // ✅ Changed from currentUser to user
      );
      const dogsSnapshot = await getDocs(dogsQuery);
      const deleteDogsPromises = dogsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteDogsPromises);

      // Delete user's conversations
      const conversationsQuery = query(
        collection(db, 'conversations'),
        where('participants', 'array-contains', user.uid) // ✅ Changed from currentUser to user
      );
      const conversationsSnapshot = await getDocs(conversationsQuery);
      const deleteConversationsPromises = conversationsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteConversationsPromises);

      // Delete user's favorites
      const favoritesQuery = query(
        collection(db, 'favorites'),
        where('userId', '==', user.uid) // ✅ Changed from currentUser to user
      );
      const favoritesSnapshot = await getDocs(favoritesQuery);
      const deleteFavoritesPromises = favoritesSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deleteFavoritesPromises);

      // Delete user document
      await deleteDoc(doc(db, 'users', user.uid)); // ✅ Changed from currentUser to user

      // Delete Firebase Auth user
      await deleteUser(user); // ✅ Changed from currentUser to user

      toast.success('Your account and all data have been deleted');
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account. You may need to re-login and try again, or contact support.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="max-w-4xl mx-auto my-10 p-6 sm:p-8 bg-white/95 dark:bg-zinc-800/95 rounded-xl shadow-xl backdrop-blur-sm border border-zinc-200 dark:border-zinc-700">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-[#8c5628] dark:text-amber-400 hover:text-[#6d4320] dark:hover:text-amber-300 font-medium transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h1 className="text-4xl font-bold text-[#573a1c] dark:text-amber-200 mb-4">
        Privacy Policy
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <div className="prose dark:prose-invert max-w-none space-y-6 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            1. Information We Collect
          </h2>
          <p>
            When you use Waggle, we collect the following information:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Account Information:</strong> Email address, name, profile photo</li>
            <li><strong>Authentication Data:</strong> If you use Facebook Login, we receive your Facebook User ID</li>
            <li><strong>Dog Information:</strong> Names, breeds, ages, photos, and descriptions</li>
            <li><strong>Usage Data:</strong> How you interact with our service</li>
            <li><strong>Location Data:</strong> If you choose to share your location</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            2. How We Use Your Information
          </h2>
          <p>We use your information to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide and improve our dog breeding matching service</li>
            <li>Connect you with other dog owners</li>
            <li>Send you important updates about your account</li>
            <li>Ensure the safety and security of our platform</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            3. Information Sharing
          </h2>
          <p>
            We do not sell your personal information. We share information only when:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>You explicitly choose to share it (e.g., dog profiles, contact info)</li>
            <li>Required by law or legal process</li>
            <li>Necessary to protect our rights or safety</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            4. Data Security
          </h2>
          <p>
            We use industry-standard security measures including:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Encrypted data transmission (HTTPS/SSL)</li>
            <li>Secure authentication via Firebase</li>
            <li>Firestore security rules to protect your data</li>
            <li>Regular security audits</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            5. Your Rights
          </h2>
          <p>You have the right to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data (see section 10 below)</li>
            <li>Export your data</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            6. Facebook Login
          </h2>
          <p>
            If you choose to sign in with Facebook, we receive limited information from Facebook 
            based on your Facebook privacy settings. This typically includes your name, email, 
            and profile picture. Your use of Facebook services is governed by Facebook's own 
            Privacy Policy. You can revoke Waggle's access to your Facebook account at any time 
            through your Facebook settings.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            7. Cookies
          </h2>
          <p>
            We use cookies and similar technologies to improve your experience, 
            remember your preferences, and analyze site usage.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            8. Children's Privacy
          </h2>
          <p>
            Our service is not intended for children under 18. We do not knowingly 
            collect information from children.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            9. Changes to Privacy Policy
          </h2>
          <p>
            We may update this policy from time to time. We will notify you of 
            significant changes via email or through the platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            10. Data Deletion
          </h2>
          <p className="mb-4">
            You can request deletion of your data at any time. We provide two options:
          </p>

          <button
            onClick={() => setShowDeleteSection(!showDeleteSection)}
            className="mb-4 px-4 py-2 bg-[#8c5628] dark:bg-amber-700 text-white rounded-lg hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors font-medium"
          >
            {showDeleteSection ? 'Hide' : 'Show'} Data Deletion Options
          </button>

          {showDeleteSection && (
            <div className="bg-gray-50 dark:bg-zinc-900/50 rounded-lg p-6 space-y-6 border border-gray-200 dark:border-zinc-700">
              {/* Option 1: Delete Through App */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Option 1: Delete Through Our App
                </h3>
                
                {user ? (
                  <div className="bg-red-50 dark:bg-red-900/10 border-2 border-red-200 dark:border-red-800 rounded-lg p-6">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="text-2xl">⚠️</div>
                      <div>
                        <p className="text-red-800 dark:text-red-300 font-semibold mb-2">
                          Warning: This action cannot be undone!
                        </p>
                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                          Deleting your account will permanently remove:
                        </p>
                        <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1 mb-4">
                          <li>Your profile information</li>
                          <li>All your dog listings</li>
                          <li>All your messages and conversations</li>
                          <li>All your favorites</li>
                          <li>Your authentication data (including Facebook login)</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Type "DELETE" to confirm (in capital letters):
                      </label>
                      <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="DELETE"
                      />
                    </div>

                    <button
                      onClick={handleDeleteAccount}
                      disabled={loading || confirmText !== 'DELETE'}
                      className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Deleting...
                        </span>
                      ) : (
                        'Delete My Account and All Data'
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6">
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Please log in to delete your account directly through our app.
                    </p>
                    <button
                      onClick={() => navigate('/signin')}
                      className="px-6 py-2 bg-[#8c5628] dark:bg-amber-700 text-white rounded-lg hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors font-medium"
                    >
                      Go to Sign In
                    </button>
                  </div>
                )}
              </div>

              {/* Option 2: Email Request */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Option 2: Request Deletion via Email
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  If you cannot log in or prefer to request deletion via email, send your request to:
                </p>
                <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 mb-4 border border-gray-200 dark:border-zinc-700">
                  <a 
                    href="mailto:privacy@waggle.com?subject=Data Deletion Request"
                    className="font-mono text-[#8c5628] dark:text-amber-400 hover:underline"
                  >
                    privacy@waggle.com
                  </a>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  Please include in your email:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1 mb-4">
                  <li>The email address associated with your account</li>
                  <li>Your Facebook User ID (if you used Facebook Login)</li>
                  <li>A clear statement that you want your data deleted</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  We will process your request within 30 days and send you a confirmation email.
                </p>
              </div>

              {/* What Gets Deleted */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  What Data Gets Deleted?
                </h3>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
                  <li>Personal information (name, email, profile picture)</li>
                  <li>All dog listings you created</li>
                  <li>Messages and conversation history</li>
                  <li>Favorites and preferences</li>
                  <li>Account authentication data (including Facebook login connection)</li>
                </ul>
              </div>

              {/* Data Retention */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  Data We May Retain
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  For legal or security purposes, we may retain:
                </p>
                <ul className="list-disc pl-6 text-gray-700 dark:text-gray-300 space-y-1">
                  <li>Anonymized logs for security and fraud prevention</li>
                  <li>Data required for legal compliance</li>
                  <li>Backup data (will be deleted within 90 days)</li>
                </ul>
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            11. Contact Us
          </h2>
          <p>
            For privacy concerns or questions, contact us at:{' '}
            <a href="mailto:privacy@waggle.com" className="text-[#8c5628] dark:text-amber-400 hover:underline">
              privacy@waggle.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;