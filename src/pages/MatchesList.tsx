import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import toast from 'react-hot-toast';

interface DogProfile {
  id: string;
  name: string;
  breed: string;
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

        const matchesQuery = query(collection(db, 'matches'), where('createdBy', '==', user.uid));
        const matchesSnapshot = await getDocs(matchesQuery);
        const matchRecords: MatchRecord[] = matchesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<MatchRecord, 'id'>),
        }));

        const dogIdsSet = new Set<string>();
        matchRecords.forEach(match => {
          dogIdsSet.add(match.dog1);
          dogIdsSet.add(match.dog2);
        });
        const dogIds = Array.from(dogIdsSet);

        const dogProfiles: { [id: string]: DogProfile } = {};
        if (dogIds.length) {
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
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <h2 className="text-2xl font-semibold text-[#194d33] mb-6 text-center">Your Matches</h2>
      {loading ? (
        <div className="text-center text-gray-500 text-lg">Loading...</div>
      ) : matches.length === 0 ? (
        <div className="text-center text-gray-600 text-base">No matches found.</div>
      ) : (
        <ul className="space-y-4">
          {matches.map(match => {
            const dog1 = dogs[match.dog1];
            const dog2 = dogs[match.dog2];
            return (
              <li
                key={match.id}
                className="bg-white rounded-lg shadow-md p-5 flex flex-col gap-2"
              >
                <div className="flex justify-between items-center text-gray-800 text-base font-medium">
                  <span>
                    {dog1 ? (
                      <>
                        <strong>{dog1.name}</strong> <em className="text-gray-500">({dog1.breed})</em>
                      </>
                    ) : (
                      'Dog not found'
                    )}
                  </span>
                  <span className="text-sm text-gray-400">vs</span>
                  <span>
                    {dog2 ? (
                      <>
                        <strong>{dog2.name}</strong> <em className="text-gray-500">({dog2.breed})</em>
                      </>
                    ) : (
                      'Dog not found'
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{match.date ? new Date(match.date).toLocaleDateString() : 'Unknown date'}</span>
                  <span>{match.location}</span>
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
