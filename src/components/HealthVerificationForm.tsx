// src/components/HealthVerificationForm.tsx
import { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/firebase';
import { useAuth } from '@/context';
import toast from 'react-hot-toast';

interface HealthInfo {
  vetVerified: boolean;
  vetName: string;
  vetPhone: string;
  lastCheckupDate: string;
  hipsDysplasiaCleared: boolean;
  elbowDysplasiaCleared: boolean;
  eyesCleared: boolean;
  heartCleared: boolean;
  geneticTestingDone: boolean;
  geneticTestResults: string[];
  vaccinationUpToDate: boolean;
  brucellosisTest: boolean;
  brucellosisTestDate: string;
  hasHereditaryConditions: boolean;
  hereditaryConditionsDetails: string;
  vetCertificateUrl?: string;
  vaccinationRecordUrl?: string;
}

interface HealthVerificationFormProps {
  onComplete: (healthInfo: HealthInfo) => void;
}

const HealthVerificationForm: React.FC<HealthVerificationFormProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [healthInfo, setHealthInfo] = useState<HealthInfo>({
    vetVerified: false,
    vetName: '',
    vetPhone: '',
    lastCheckupDate: '',
    hipsDysplasiaCleared: false,
    elbowDysplasiaCleared: false,
    eyesCleared: false,
    heartCleared: false,
    geneticTestingDone: false,
    geneticTestResults: [],
    vaccinationUpToDate: false,
    brucellosisTest: false,
    brucellosisTestDate: '',
    hasHereditaryConditions: false,
    hereditaryConditionsDetails: '',
  });
  
  const [files, setFiles] = useState<{
    vetCertificate?: File;
    vaccinationRecord?: File;
  }>({});

  const handleFileChange = (type: 'vetCertificate' | 'vaccinationRecord', file: File | null) => {
    if (file && file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    if (file) {
      setFiles(prev => ({ ...prev, [type]: file }));
    }
  };

  const uploadDocument = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!healthInfo.vetVerified) {
      toast.error('Veterinary verification is required');
      return;
    }
    
    if (!healthInfo.brucellosisTest) {
      toast.error('Brucellosis test is mandatory for breeding dogs');
      return;
    }
    
    if (!healthInfo.vaccinationUpToDate) {
      toast.error('Vaccinations must be up to date');
      return;
    }
    
    if (!files.vetCertificate) {
      toast.error('Please upload veterinary certificate');
      return;
    }

    setLoading(true);
    try {
      // Upload documents
      const vetCertificateUrl = files.vetCertificate 
        ? await uploadDocument(files.vetCertificate, `health_certificates/${user?.uid}/${Date.now()}_vet.pdf`)
        : undefined;
        
      const vaccinationRecordUrl = files.vaccinationRecord
        ? await uploadDocument(files.vaccinationRecord, `vaccination_records/${user?.uid}/${Date.now()}_vacc.pdf`)
        : undefined;

      const completeHealthInfo: HealthInfo = {
        ...healthInfo,
        vetCertificateUrl,
        vaccinationRecordUrl,
      };

      onComplete(completeHealthInfo);
      toast.success('Health information submitted successfully!');
    } catch (error) {
      console.error('Error uploading health documents:', error);
      toast.error('Failed to upload health documents');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg mb-6">
        <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-2">
          ⚠️ Important: Responsible Breeding Requirements
        </h3>
        <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-1 list-disc list-inside">
          <li>All breeding dogs must be veterinary verified</li>
          <li>Health clearances for breed-specific conditions required</li>
          <li>Brucellosis testing is mandatory</li>
          <li>Dogs must be at least 2 years old to breed</li>
          <li>Maximum breeding age varies by breed (typically 8 years)</li>
        </ul>
      </div>

      {/* Veterinary Verification */}
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Veterinary Verification
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="vetVerified"
              checked={healthInfo.vetVerified}
              onChange={(e) => setHealthInfo({ ...healthInfo, vetVerified: e.target.checked })}
              className="w-4 h-4"
              title="Veterinary verification checkbox"
            />
            <label htmlFor="vetVerified" className="text-gray-900 dark:text-gray-100">
              My dog has been examined by a licensed veterinarian *
            </label>
          </div>

          <div>
            <label htmlFor="vetName" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Veterinarian Name *
            </label>
            <input
              type="text"
              id="vetName"
              value={healthInfo.vetName}
              onChange={(e) => setHealthInfo({ ...healthInfo, vetName: e.target.value })}
              required
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg"
              placeholder="Dr. Jane Smith"
              title="Enter veterinarian's full name"
            />
          </div>

          <div>
            <label htmlFor="vetPhone" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Veterinarian Phone *
            </label>
            <input
              type="tel"
              id="vetPhone"
              value={healthInfo.vetPhone}
              onChange={(e) => setHealthInfo({ ...healthInfo, vetPhone: e.target.value })}
              required
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg"
              placeholder="+1 (555) 123-4567"
              title="Enter veterinarian's contact phone number"
            />
          </div>

          <div>
            <label htmlFor="lastCheckupDate" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Last Checkup Date *
            </label>
            <input
              type="date"
              id="lastCheckupDate"
              value={healthInfo.lastCheckupDate}
              onChange={(e) => setHealthInfo({ ...healthInfo, lastCheckupDate: e.target.value })}
              required
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg"
              title="Select the date of last veterinary checkup"
            />
          </div>

          <div>
            <label htmlFor="vetCertificate" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Upload Veterinary Certificate * (PDF, max 10MB)
            </label>
            <input
              type="file"
              id="vetCertificate"
              accept=".pdf,image/*"
              onChange={(e) => handleFileChange('vetCertificate', e.target.files?.[0] || null)}
              required
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg"
              title="Upload veterinary certificate document"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Must include vet's stamp/signature and examination date
            </p>
          </div>
        </div>
      </div>

      {/* Health Clearances */}
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Health Clearances
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hipsCleared"
              checked={healthInfo.hipsDysplasiaCleared}
              onChange={(e) => setHealthInfo({ ...healthInfo, hipsDysplasiaCleared: e.target.checked })}
              className="w-4 h-4"
              title="Hip dysplasia clearance status"
            />
            <label htmlFor="hipsCleared" className="text-gray-900 dark:text-gray-100">
              Hips Dysplasia - Cleared (OFA/PennHIP)
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="elbowsCleared"
              checked={healthInfo.elbowDysplasiaCleared}
              onChange={(e) => setHealthInfo({ ...healthInfo, elbowDysplasiaCleared: e.target.checked })}
              className="w-4 h-4"
              title="Elbow dysplasia clearance status"
            />
            <label htmlFor="elbowsCleared" className="text-gray-900 dark:text-gray-100">
              Elbow Dysplasia - Cleared (OFA)
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="eyesCleared"
              checked={healthInfo.eyesCleared}
              onChange={(e) => setHealthInfo({ ...healthInfo, eyesCleared: e.target.checked })}
              className="w-4 h-4"
              title="Eye condition clearance status"
            />
            <label htmlFor="eyesCleared" className="text-gray-900 dark:text-gray-100">
              Eyes - Cleared (CERF/OFA)
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="heartCleared"
              checked={healthInfo.heartCleared}
              onChange={(e) => setHealthInfo({ ...healthInfo, heartCleared: e.target.checked })}
              className="w-4 h-4"
              title="Heart condition clearance status"
            />
            <label htmlFor="heartCleared" className="text-gray-900 dark:text-gray-100">
              Heart - Cleared (Cardiologist)
            </label>
          </div>
        </div>
      </div>

      {/* Genetic Testing */}
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Genetic Testing
        </h3>
        
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            id="geneticTesting"
            checked={healthInfo.geneticTestingDone}
            onChange={(e) => setHealthInfo({ ...healthInfo, geneticTestingDone: e.target.checked })}
            className="w-4 h-4"
            title="Genetic testing completion status"
          />
          <label htmlFor="geneticTesting" className="text-gray-900 dark:text-gray-100">
            Genetic testing completed (Embark, Wisdom Panel, etc.)
          </label>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Recommended for responsible breeding to avoid passing on genetic diseases
        </p>
      </div>

      {/* Brucellosis Test (MANDATORY) */}
      <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border-2 border-red-200 dark:border-red-800">
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-200 mb-4">
          ⚠️ Brucellosis Test (MANDATORY)
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="brucellosisTest"
              checked={healthInfo.brucellosisTest}
              onChange={(e) => setHealthInfo({ ...healthInfo, brucellosisTest: e.target.checked })}
              className="w-4 h-4"
              required
              title="Brucellosis test completion confirmation"
            />
            <label htmlFor="brucellosisTest" className="text-red-900 dark:text-red-200 font-medium">
              Brucellosis test completed and negative *
            </label>
          </div>

          <div>
            <label htmlFor="brucellosisTestDate" className="block text-sm font-medium text-red-900 dark:text-red-200 mb-2">
              Test Date *
            </label>
            <input
              type="date"
              id="brucellosisTestDate"
              value={healthInfo.brucellosisTestDate}
              onChange={(e) => setHealthInfo({ ...healthInfo, brucellosisTestDate: e.target.value })}
              required
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-red-300 dark:border-red-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg"
              title="Select brucellosis test date"
            />
            <p className="text-xs text-red-700 dark:text-red-300 mt-1">
              Test must be within last 6 months
            </p>
          </div>
        </div>
      </div>

      {/* Vaccinations */}
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Vaccinations
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="vaccinationUpToDate"
              checked={healthInfo.vaccinationUpToDate}
              onChange={(e) => setHealthInfo({ ...healthInfo, vaccinationUpToDate: e.target.checked })}
              className="w-4 h-4"
              required
              title="Vaccination status confirmation"
            />
            <label htmlFor="vaccinationUpToDate" className="text-gray-900 dark:text-gray-100">
              All vaccinations are up to date *
            </label>
          </div>

          <div>
            <label htmlFor="vaccinationRecord" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Upload Vaccination Record (Optional)
            </label>
            <input
              type="file"
              id="vaccinationRecord"
              accept=".pdf,image/*"
              onChange={(e) => handleFileChange('vaccinationRecord', e.target.files?.[0] || null)}
              className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg"
              title="Upload vaccination record document"
            />
          </div>
        </div>
      </div>

      {/* Hereditary Conditions */}
      <div className="bg-white dark:bg-zinc-800 p-6 rounded-lg border border-zinc-200 dark:border-zinc-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Hereditary Conditions
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="hasHereditaryConditions"
              checked={healthInfo.hasHereditaryConditions}
              onChange={(e) => setHealthInfo({ ...healthInfo, hasHereditaryConditions: e.target.checked })}
              className="w-4 h-4"
              title="Hereditary conditions confirmation"
            />
            <label htmlFor="hasHereditaryConditions" className="text-gray-900 dark:text-gray-100">
              This dog has known hereditary conditions
            </label>
          </div>

          {healthInfo.hasHereditaryConditions && (
            <div>
              <label htmlFor="hereditaryConditionsDetails" className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Please describe the conditions *
              </label>
              <textarea
                id="hereditaryConditionsDetails"
                value={healthInfo.hereditaryConditionsDetails}
                onChange={(e) => setHealthInfo({ ...healthInfo, hereditaryConditionsDetails: e.target.value })}
                required={healthInfo.hasHereditaryConditions}
                rows={3}
                className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-gray-100 rounded-lg"
                placeholder="Describe any known hereditary conditions..."
                title="Enter detailed description of hereditary conditions"
              />
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                ⚠️ Dogs with serious hereditary conditions may not be approved for breeding
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full px-6 py-3 bg-[#8c5628] dark:bg-amber-700 text-white rounded-lg hover:bg-[#6d4320] dark:hover:bg-amber-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        title="Submit health information for verification"
      >
        {loading ? 'Uploading...' : 'Submit Health Information'}
      </button>
    </form>
  );
};

export default HealthVerificationForm;