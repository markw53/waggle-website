import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import toast from 'react-hot-toast';
import './MatchesList.css';

interface DogProfile {
  id: string;
  name: string;
  breed: string;
  // Add additional fields as needed
}

interface MatchRecord {
  id: string;
  dog1: string;
  dog2: string;
  date: string;
  location: string;
  createdAt?: Date | string;
}

const MatchesList: React.FC = () => {
  const [matches, setMatches] = useState<MatchRecord[]>([]);
  const [dogs, setDogs] = useState<{ [id: string]: DogProfile }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatchesAndDogs = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (!user) return;

        // Get matches created by current user
        const matchesQuery = query(
          collection(db, 'matches'),
          where('createdBy', '==', user.uid)
        );
        const matchesSnapshot = await getDocs(matchesQuery);
        const matchRecords: MatchRecord[] = matchesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<MatchRecord, 'id'>),
        }));

        // Gather all unique dog IDs from matches
        const dogIdsSet = new Set<string>();
        matchRecords.forEach(match => {
          dogIdsSet.add(match.dog1);
          dogIdsSet.add(match.dog2);
        });
        const dogIds = Array.from(dogIdsSet);

        const dogProfiles: { [id: string]: DogProfile } = {};
        if (dogIds.length) {
          // Fetch all dogs in a single batched collection get
          const dogsCol = collection(db, 'dogs');
          const dogsSnapshot = await getDocs(dogsCol);
          dogsSnapshot.forEach(doc => {
            if (dogIds.includes(doc.id)) {
              dogProfiles[doc.id] = {
                id: doc.id,
                ...(doc.data() as Omit<DogProfile, 'id'>),
              };
            }
          });
        }

        setDogs(dogProfiles);
        setMatches(matchRecords);
      } catch {
        toast.error('Failed to load matches.');
      }
      setLoading(false);
    };

    fetchMatchesAndDogs();
  }, []);

  return (
    <div className="matches-list-container">
      <h2>Your Matches</h2>
      {loading ? (
        <div className="matches-list-loading">Loading...</div>
      ) : matches.length === 0 ? (
        <div className="matches-list-empty">No matches found.</div>
      ) : (
        <ul className="matches-list">
          {matches.map(match => {
            const dog1 = dogs[match.dog1];
            const dog2 = dogs[match.dog2];
            return (
              <li key={match.id} className="matches-list-item">
                <div className="match-dogs">
                  <span className="dog-info">
                    {dog1 ? (
                      <>
                        <strong>{dog1.name}</strong> <em>({dog1.breed})</em>
                      </>
                    ) : 'Dog not found'}
                  </span>
                  <span className="match-vs">vs</span>
                  <span className="dog-info">
                    {dog2 ? (
                      <>
                        <strong>{dog2.name}</strong> <em>({dog2.breed})</em>
                      </>
                    ) : 'Dog not found'}
                  </span>
                </div>
                <div className="match-details">
                  <span className="match-date">
                    {match.date
                      ? new Date(match.date).toLocaleDateString()
                      : 'Unknown date'}
                  </span>
                  <span className="match-location">
                    {match.location}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default MatchesList;