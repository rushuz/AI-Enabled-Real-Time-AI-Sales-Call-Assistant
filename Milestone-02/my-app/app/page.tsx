"use client";
import { CloseIcon } from "@/components/CloseIcon";
import { NoAgentNotification } from "@/components/NoAgentNotification";
import logo from './logo.webp';

import {
  BarVisualizer,
  DisconnectButton,
  RoomAudioRenderer,
  RoomContext,
  VideoTrack,
  VoiceAssistantControlBar,
  useVoiceAssistant,
} from "@livekit/components-react";
import { AnimatePresence, motion } from "framer-motion";
import { Room, RoomEvent } from "livekit-client";
import { useCallback, useEffect, useState } from "react";
import type { ConnectionDetails } from "./api/connection-details/route";

// API base URL
const API_BASE_URL = "https://inextlabs-demo-medical-transcription-bot-as.azurewebsites.net";

interface PrescriptionFormData {
  doctorName: string;
  patientName: string;
  patientId: string;
  pharmacyName: string;
  medicine: string;
  dosage: string;
}

interface TranscriptionSegment {
  id: number;
  text: string;
  speaker: string;
  timestamp: number;
}

// Medical Icons Components
function StethoscopeIcon() {
  return (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l6 6Z" />
    </svg>
  );
}

function HeartPulseIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function MicrophoneIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} x1="12" y1="19" x2="12" y2="23" />
      <line strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}

function PrescriptionIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}


function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <header className="bg-white shadow-md border-2 border-gray-200 rounded-xl mx-4 mt-4">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img src="/logo.webp" alt="iNextLabs Logo" className="w-25 h-12" />
          </div>
          <div className="flex items-center space-x-6">
            <a href="https://inextlabs-demo-inext-medical-transcription-bot-as.azurewebsites.net/" className="text-gray-600 hover:text-orange-500 transition-colors duration-300 font-medium">
              <i className="fas fa-stethoscope mr-2"></i> Medical Transcription
            </a>
            <a href="/" className="text-gray-600 hover:text-orange-500 transition-colors duration-300 font-medium">
              <i className="fas fa-prescription-bottle-alt mr-2"></i> Doctor Prescription
            </a>
            <a href="https://inextlabs-demo-inext-medical-transcription-bot-as.azurewebsites.net/appointment-scheduling.html" className="text-gray-600 hover:text-orange-500 transition-colors duration-300 font-medium">
              <i className="fas fa-prescription-bottle-alt mr-2"></i> Appointment Scheduling
            </a>
          </div>
          <button 
            className="text-white px-4 py-2 rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-xl font-semibold text-sm"
            style={{ backgroundColor: '#f05742' }}
          >
            <div className="flex items-center">
              <i className="fas fa-user-circle mr-2"></i>
              <div className="text-left">
                <div className="font-semibold">Dr. John Smith</div>
                <div className="text-xs text-white/80">
                  {isClient ? formatDateTime(currentTime) : 'Loading...'}
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
function Footer() {
  return (
    <motion.footer 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      className="bg-white border-t-2 border-gray-100 px-6 py-6 mt-auto"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <p className="text-gray-600 text-sm">
              © 2025 MedScribe AI. Advanced Medical Documentation.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-500 hover:text-[#f05742] transition-colors text-sm">
                Privacy Policy
              </a>
              <span className="text-gray-300">•</span>
              <a href="#" className="text-gray-500 hover:text-[#f05742] transition-colors text-sm">
                Terms of Service
              </a>
              <span className="text-gray-300">•</span>
              <a href="#" className="text-gray-500 hover:text-[#f05742] transition-colors text-sm">
                HIPAA Compliance
              </a>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Secure Connection
          </div>
        </div>
      </div>
    </motion.footer>
  );
}

function PrescriptionForm() {
  const [formData, setFormData] = useState<PrescriptionFormData>({
    doctorName: '',
    patientName: '',
    patientId: '',
    pharmacyName: '',
    medicine: '',
    dosage: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastExtractionTime, setLastExtractionTime] = useState(0);
  const [isAutoExtracting, setIsAutoExtracting] = useState(false);

  const handleInputChange = (field: keyof PrescriptionFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
interface SavedPrescription extends PrescriptionFormData {
  id: string;
  timestamp: string;
}
const clearAllData = async () => {
  try {
    await fetch(`${API_BASE_URL}/clear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Clear local form state
    handleClearForm();
    
    // Clear transcriptions by refreshing the page or setting empty state
    window.location.reload();
  } catch (error) {
    console.error('Error clearing all data:', error);
  }
};
const [savedPrescriptions, setSavedPrescriptions] = useState<SavedPrescription[]>([]);
  const handleClearForm = () => {
    setFormData({
      doctorName: '',
      patientName: '',
      patientId: '',
      pharmacyName: '',
      medicine: '',
      dosage: ''
    });
  };// 3. Fixed handleSavePrescription function
const handleSavePrescription = async () => {
  if (!formData.doctorName || !formData.patientName || !formData.patientId || 
      !formData.medicine || !formData.dosage || !formData.pharmacyName) {
    alert('Please fill in all fields');
    return;
  }
  setIsSubmitting(true);
  try {
    const response = await fetch(`${API_BASE_URL}/save-prescription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    if (response.ok) {
      const result = await response.json();
      alert('Prescription saved successfully!');
      
      // Add to saved prescriptions list
      const savedPrescription: SavedPrescription = {
        id: result.id,
        ...formData,
        timestamp: new Date().toISOString()
      };
      setSavedPrescriptions(prev => [...prev, savedPrescription]);
      
      handleClearForm();
    } else {
      alert('Failed to save prescription');
    }
  } catch (error) {
    console.error('Error saving prescription:', error);
    alert('Error saving prescription');
  } finally {
    setIsSubmitting(false);
  }
};


// Add this function to fetch saved prescriptions
const fetchSavedPrescriptions = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/saved-info`);
    if (response.ok) {
      const data = await response.json();
      setSavedPrescriptions(data.saved_prescriptions || []);
    }
  } catch (error) {
    console.error('Error fetching saved prescriptions:', error);
  }
};

const deleteSavedPrescription = async (prescriptionId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/saved-info/${prescriptionId}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      setSavedPrescriptions(prev => prev.filter(p => p.id !== prescriptionId));
    } else {
      alert('Failed to delete prescription');
    }
  } catch (error) {
    console.error('Error deleting prescription:', error);
    alert('Error deleting prescription');
  }
};
useEffect(() => {
  fetchSavedPrescriptions();
}, []);
// Add this useEffect in the main Page component, after the existing useEffect
useEffect(() => {
  const handleBeforeUnload = async () => {
    try {
      await fetch(`${API_BASE_URL}/clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Error clearing data on page unload:', error);
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}, []);
  const autoExtractFromConversation = async () => {
    if (isAutoExtracting) return;
    
    setIsAutoExtracting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/extract-from-conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ room_id: 'default-room' }),
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.success && result.extracted_data) {
          const extracted = result.extracted_data;
          
          setFormData(prevData => {
            const newData = {
              doctorName: (extracted.doctor_name && extracted.doctor_name.trim()) || prevData.doctorName,
              patientName: (extracted.patient_name && extracted.patient_name.trim()) || prevData.patientName,
              patientId: (extracted.patient_id && extracted.patient_id.trim()) || prevData.patientId,
              pharmacyName: (extracted.pharmacy_name && extracted.pharmacy_name.trim()) || prevData.pharmacyName,
              medicine: (extracted.medicine && extracted.medicine.trim()) || prevData.medicine,
              dosage: (extracted.dosage && extracted.dosage.trim()) || prevData.dosage
            };
            
            const hasChanges = Object.keys(newData).some(key => 
              newData[key as keyof PrescriptionFormData] !== prevData[key as keyof PrescriptionFormData]
            );
            
            if (hasChanges) {
              console.log('Auto-extracted new data:', extracted);
            }
            
            return newData;
          });
          
          setLastExtractionTime(Date.now());
        }
      }
    } catch (error) {
      console.error('Error in auto-extraction:', error);
    } finally {
      setIsAutoExtracting(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      autoExtractFromConversation();
    }, 2000);
    return () => clearInterval(interval);
  }, [isAutoExtracting]);

  return (
    <motion.div 
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex-1 bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#f05742] to-[#f05742] rounded-lg flex items-center justify-center">
            <PrescriptionIcon />
          </div>
          <h3 className="text-gray-800 text-xl font-bold">Prescription Details</h3>
        </div>
        <motion.button
          onClick={handleClearForm}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-[#f05742] hover:bg-gray-50 rounded-lg transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ClearIcon />
          Clear
        </motion.button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <label className="block text-gray-700 text-sm font-semibold mb-3">
            Doctor Name
          </label>
          <input
            type="text"
            value={formData.doctorName}
            onChange={(e) => handleInputChange('doctorName', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#f05742] focus:border-transparent transition-all"
            placeholder="Dr. John Smith"
          />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <label className="block text-gray-700 text-sm font-semibold mb-3">
            Patient Name
          </label>
          <input
            type="text"
            value={formData.patientName}
            onChange={(e) => handleInputChange('patientName', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#f05742] focus:border-transparent transition-all"
            placeholder="Patient Name"
          />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <label className="block text-gray-700 text-sm font-semibold mb-3">
            Patient ID
          </label>
          <input
            type="text"
            value={formData.patientId}
            onChange={(e) => handleInputChange('patientId', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#f05742] focus:border-transparent transition-all"
            placeholder="P-12345"
          />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <label className="block text-gray-700 text-sm font-semibold mb-3">
            Pharmacy Name
          </label>
          <input
            type="text"
            value={formData.pharmacyName}
            onChange={(e) => handleInputChange('pharmacyName', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#f05742] focus:border-transparent transition-all"
            placeholder="MedPlus Pharmacy"
          />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="md:col-span-2"
        >
          <label className="block text-gray-700 text-sm font-semibold mb-3">
            Medicine/Prescription
          </label>
          <input
            type="text"
            value={formData.medicine}
            onChange={(e) => handleInputChange('medicine', e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#f05742] focus:border-transparent transition-all"
            placeholder="Amoxicillin 500mg"
          />
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="md:col-span-2"
        >
          <label className="block text-gray-700 text-sm font-semibold mb-3">
            Dosage Instructions
          </label>
          <textarea
            value={formData.dosage}
            onChange={(e) => handleInputChange('dosage', e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#f05742] focus:border-transparent transition-all resize-none"
            placeholder="Take 1 tablet twice daily with food for 7 days"
          />
        </motion.div>
      </div>

      <motion.div 
        className="mt-8 space-y-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.7 }}
      >
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
          <div className="flex items-center gap-3">
            <motion.div 
              className={`w-3 h-3 rounded-full ${isAutoExtracting ? 'bg-green-500' : 'bg-gray-400'}`}
              animate={isAutoExtracting ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-gray-700 text-sm font-medium">
              {isAutoExtracting ? 'Extracting from conversation...' : 'Listening for medical data...'}
            </span>
          </div>
          <MicrophoneIcon />
        </div>
        
       <motion.button
  onClick={handleSavePrescription}
  disabled={isSubmitting}
  className="w-full px-6 py-4 bg-[#f05742] text-white rounded-xl hover:bg-[#e04632] transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-lg shadow-lg"
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>
  {isSubmitting ? (
    <div className="flex items-center justify-center gap-2">
      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      Saving Prescription...
    </div>
  ) : (
    'Save Prescription'
  )}
</motion.button>
      
      </motion.div>
         
{savedPrescriptions.length > 0 && (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.6, delay: 0.8 }}
    className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200"
  >
    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
      <PrescriptionIcon />
      Saved Prescriptions ({savedPrescriptions.length})
    </h4>
    <div className="space-y-3 max-h-64 overflow-y-auto">
      {savedPrescriptions.map((prescription) => (
        <motion.div
          key={prescription.id}
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="font-medium">Patient:</span> {prescription.patientName}</div>
                <div><span className="font-medium">Doctor:</span> {prescription.doctorName}</div>
                <div><span className="font-medium">Medicine:</span> {prescription.medicine}</div>
                <div><span className="font-medium">Dosage:</span> {prescription.dosage}</div>
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Saved: {new Date(prescription.timestamp).toLocaleString()}
              </div>
            </div>
            <button
              onClick={() => deleteSavedPrescription(prescription.id)}
              className="ml-4 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
              title="Delete prescription"
            >
              <ClearIcon />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
)}
    </motion.div>
    
  );
}


function TranscriptionSection() {
  const [transcriptions, setTranscriptions] = useState<TranscriptionSegment[]>([]);

  useEffect(() => {
    const fetchTranscriptions = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/transcriptions`);
        if (response.ok) {
          const data = await response.json();
          setTranscriptions(data.transcriptions || []);
        }
      } catch (error) {
        console.error('Error fetching transcriptions:', error);
      }
    };

    fetchTranscriptions();
    const interval = setInterval(fetchTranscriptions, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div 
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex-1 bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
          <MicrophoneIcon />
        </div>
        <h3 className="text-gray-800 text-xl font-bold">Live Transcription</h3>
      </div>
      
      <div className="h-96 overflow-y-auto bg-gradient-to-b from-gray-50 to-white rounded-xl border border-gray-200 p-6">
        {transcriptions.length === 0 ? (
          <motion.div 
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <MicrophoneIcon />
            </div>
            <p className="text-gray-500 text-lg mb-2">No conversation yet</p>
            <p className="text-gray-400 text-sm">Start speaking to see real-time transcription</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {transcriptions.map((segment, index) => (
              <motion.div
                key={segment.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`p-4 rounded-2xl shadow-sm ${
                  segment.speaker === 'user' 
                    ? 'bg-gradient-to-r from-[#f05742]/10 to-[#d63384]/10 border border-[#f05742]/20 ml-8' 
                    : 'bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 mr-8'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${
                    segment.speaker === 'user' ? 'bg-[#f05742]' : 'bg-blue-500'
                  }`}></div>
                  <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    {segment.speaker === 'user' ? 'Doctor' : 'AI Assistant'}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(segment.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-gray-800 leading-relaxed">{segment.text}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function AgentVisualizer() {
  const { state: agentState, videoTrack, audioTrack } = useVoiceAssistant();
  const handleCancel = async () => {
    try {
      await fetch(`${API_BASE_URL}/clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      // Optionally refresh the page or clear local state
      window.location.reload();
    } catch (error) {
      console.error('Error clearing data on cancel:', error);
    }
  };
  if (videoTrack) {
    return (
      <motion.div 
        className="h-[200px] w-[200px] rounded-2xl overflow-hidden shadow-lg border-4 border-white"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <VideoTrack trackRef={videoTrack} />
      </motion.div>
    );
  }
  
  return (
    <div className="flex items-center gap-4">
      <motion.div 
        className="h-[120px] w-full max-w-[400px] bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <BarVisualizer
          state={agentState}
          barCount={5}
          trackRef={audioTrack}
          className="agent-visualizer"
          options={{ minHeight: 24 }}
        />
      </motion.div>
      
      {/* Cancel button positioned next to the visualizer */}
      <AnimatePresence>
        {agentState !== "disconnected" && agentState !== "connecting" && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <DisconnectButton>
              <motion.button
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors shadow-md"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
            </DisconnectButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


function ControlBar(props: { onConnectButtonClicked: () => void }) {
  const { state: agentState } = useVoiceAssistant();
  
  return (
    <div className="relative h-[80px]">
      <AnimatePresence>
        {agentState === "disconnected" && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute left-1/2 -translate-x-1/2 px-8 py-4 bg-[#f05742] text-white rounded-2xl hover:bg-[#e04632] transition-all font-semibold text-lg shadow-xl"
            onClick={() => props.onConnectButtonClicked()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="flex items-center gap-3">
              <MicrophoneIcon />
              Start Medical Consultation
            </div>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

function SimpleVoiceAssistant(props: { onConnectButtonClicked: () => void }) {
  const { state: agentState } = useVoiceAssistant();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col h-full w-full"
    >
      <motion.div 
        className="flex flex-col items-center gap-6 mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <AnimatePresence mode="wait">
          {agentState === "disconnected" ? (
            <motion.button
              key="start-button"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="px-10 py-5 bg-gradient-to-r from-[#f05742] to-[#f05742] text-white rounded-2xl hover:from-[#f05742] hover:to-[#f05742] transition-all font-semibold text-xl shadow-2xl"
              onClick={() => props.onConnectButtonClicked()}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex items-center gap-3">
                <MicrophoneIcon />
                Start Medical Consultation
              </div>
            </motion.button>
          ) : (
            <motion.div
              key="voice-controls"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col items-center gap-6"
            >
              <AgentVisualizer />
              <ControlBar onConnectButtonClicked={props.onConnectButtonClicked} />
              
              <motion.div 
                className="flex items-center gap-4 text-sm text-gray-600"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Connected
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  Listening
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  Processing
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <div className="flex-1 flex gap-8 min-h-0">
        <PrescriptionForm />
        <TranscriptionSection />
      </div>
      
      <RoomAudioRenderer />
    </motion.div>
  );
}

export default function Page() {
  const [room] = useState(new Room());
  
 const onConnectButtonClicked = useCallback(async () => {
  try {
    // Clear existing data before starting new consultation
    const clearResponse = await fetch(`${API_BASE_URL}/clear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!clearResponse.ok) {
      console.warn('Failed to clear existing data');
    }
    
    // Connect to the room
    const url = new URL(
      process.env.NEXT_PUBLIC_CONN_DETAILS_ENDPOINT ?? "/api/connection-details",
      window.location.origin
    );
    const response = await fetch(url.toString());
    const connectionDetailsData: ConnectionDetails = await response.json();
    await room.connect(connectionDetailsData.serverUrl, connectionDetailsData.participantToken);
    await room.localParticipant.setMicrophoneEnabled(true);
  } catch (error) {
    console.error('Error starting consultation:', error);
    alert('Failed to start consultation. Please try again.');
  }
}, [room]);
  
  useEffect(() => {
    room.on(RoomEvent.MediaDevicesError, onDeviceFailure);
    return () => {
      room.off(RoomEvent.MediaDevicesError, onDeviceFailure);
    };
  }, [room]);
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6">
        <RoomContext.Provider value={room}>
          <div className="w-full max-w-7xl mx-auto">
            <SimpleVoiceAssistant onConnectButtonClicked={onConnectButtonClicked} />
          </div>
        </RoomContext.Provider>
      </main>
      <Footer />
    </div>
  );
}

function onDeviceFailure(error: Error) {
  console.error(error);
  alert(
    "Error acquiring camera or microphone permissions. Please make sure you grant the necessary permissions in your browser and reload the tab"
  );
}