"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  ClipboardDocumentListIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserIcon,
  StarIcon,
  ChatBubbleBottomCenterTextIcon,
  CpuChipIcon,
  FlagIcon,
  EyeIcon,
  XMarkIcon,
  HandThumbUpIcon,
  HandThumbDownIcon,
  PlusIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  PencilIcon,
  BellIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  MicrophoneIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

interface User {
  id: string;
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: string;
  title: string;
  department?: string;
}

interface ManagerObjective {
  id: string;
  title: string;
  description: string;
  category: string;
  target: number;
  current: number;
  weight: number;
  status: string;
  dueDate: string;
  quarter: string;
  year: number;
  managerId: string;
  managerName: string;
  managerTitle: string;
  progress: number;
  completedAt?: string;
  managerRemarks?: string;
  managerEvidence?: string;
  aiScore?: number;
  aiComments?: string;
  seniorManagerScore?: number;
  seniorManagerComments?: string;
  finalScore?: number;
  objectiveType?: string;
  isQuantitative?: boolean;
  quantitativeData?: {
    id: string;
    totalTargetRevenue: number;
    totalAchievedRevenue: number;
    overallProgress: number;
    practiceRevenues: Array<{
      id: string;
      practiceName: string;
      targetRevenue: number;
      achievedRevenue: number;
      progressPercentage: number;
    }>;
  };
}

interface Manager {
  id: string;
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: string;
  title: string;
  department?: string;
  teamName?: string;
  teamSize?: number;
  objectivesCount?: number;
  completionRate?: number;
  status?: string;
  detailedStatus?: string;
}

export default function SeniorManagementReviewObjectives() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth(true, ['SENIOR_MANAGEMENT', 'senior-management', 'senior_management']);
  const [completedObjectives, setCompletedObjectives] = useState<ManagerObjective[]>([]);
  const [reviewedObjectives, setReviewedObjectives] = useState<ManagerObjective[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedObjective, setSelectedObjective] = useState<ManagerObjective | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [aiScoringInProgress, setAiScoringInProgress] = useState<{[key: string]: boolean}>({});
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [seniorSignature, setSeniorSignature] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [individualSubmitting, setIndividualSubmitting] = useState<{[key: string]: boolean}>({});
  const [activeTab, setActiveTab] = useState<'pending' | 'reviewed' | 'assign'>('pending');
  
  // Individual submission modal states
  const [showIndividualSubmissionModal, setShowIndividualSubmissionModal] = useState(false);
  const [individualSignature, setIndividualSignature] = useState('');
  
  // Manager assignment states
  const [managers, setManagers] = useState<Manager[]>([]);
  const [selectedManager, setSelectedManager] = useState<string>('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignedObjectives, setAssignedObjectives] = useState<ManagerObjective[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);
  const [defaultWeightage, setDefaultWeightage] = useState(20);
  const [objectiveData, setObjectiveData] = useState({
    title: '',
    description: '',
    category: 'performance',
    target: '',
    weight: 20,
    dueDate: '',
    quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
    year: new Date().getFullYear(),
    objectiveType: 'qualitative', // NEW: 'qualitative' or 'quantitative'
    isQuantitative: false // NEW: Boolean flag
  });
  
  // NEW: Quantitative objective state
  const [practiceRevenues, setPracticeRevenues] = useState<Array<{
    id: string;
    practiceName: string;
    targetRevenue: string;
    achievedRevenue: string;
    weight: string; // Individual practice weight (e.g., "15" for 15%)
  }>>([]);
  
  // Quarterly weights tracking
  const [quarterlyWeights, setQuarterlyWeights] = useState<{[key: string]: {allocated: number, available: number}}>({});
  const [loadingWeights, setLoadingWeights] = useState(false);
  
  const router = useRouter();

  // Load default weightage from localStorage
  useEffect(() => {
    const getDefaultWeightage = () => {
      try {
        const systemSettings = localStorage.getItem("systemSettings");
        if (systemSettings) {
          const parsed = JSON.parse(systemSettings);
          const weightSetting = parsed["2"]; // Setting ID "2" is "Default Objective Weight"
          if (weightSetting && weightSetting.value) {
            const defaultWeight = parseInt(weightSetting.value);
            setDefaultWeightage(defaultWeight);
            // Update objectiveData with the default weightage
            setObjectiveData((prev) => ({ ...prev, weight: defaultWeight }));
            return;
          }
        }
      } catch (e) {
        console.error("Error loading default weightage:", e);
      }
      // Fallback to 20 if not found
      setDefaultWeightage(20);
    };

    getDefaultWeightage();
  }, []);

  useEffect(() => {
    console.log('Authentication state:', { user, isAuthenticated, authLoading });
    if (user && isAuthenticated) {
      console.log('Loading data for authenticated senior manager:', user);
      loadCompletedObjectives(user.id);
      loadManagers(); // This now loads subordinate managers
      loadAssignedObjectives();
    } else if (!authLoading) {
      console.log('User not authenticated or missing');
    }
  }, [user, isAuthenticated, authLoading]);

  // Load quarterly weights when manager or year changes
  useEffect(() => {
    if (selectedManager && objectiveData.year) {
      loadManagerQuarterlyWeights(selectedManager, objectiveData.year);
    }
  }, [selectedManager, objectiveData.year]);

  // Populate form when editing an objective
  useEffect(() => {
    if (selectedObjective && showAssignModal) {
      setSelectedManager(selectedObjective.managerId);
      
      // Check if it's a quantitative objective
      const isQuant = selectedObjective.isQuantitative || selectedObjective.objectiveType === 'quantitative';
      
      setObjectiveData({
        title: selectedObjective.title,
        description: selectedObjective.description,
        category: selectedObjective.category,
        target: String(selectedObjective.target),
        weight: selectedObjective.weight,
        dueDate: new Date(selectedObjective.dueDate).toISOString().split('T')[0],
        quarter: selectedObjective.quarter,
        year: selectedObjective.year,
        objectiveType: isQuant ? 'quantitative' : 'qualitative',
        isQuantitative: isQuant
      });

      // If quantitative, load practice revenues
      if (isQuant && (selectedObjective as any).quantitativeData?.practiceRevenues) {
        const practices = (selectedObjective as any).quantitativeData.practiceRevenues.map((p: any) => ({
          id: p.id,
          practiceName: p.practiceName,
          targetRevenue: String(p.targetRevenue),
          achievedRevenue: String(p.achievedRevenue),
          weight: String(p.weight || 0)
        }));
        setPracticeRevenues(practices);
      }
    }
  }, [selectedObjective, showAssignModal]);

  // Helper functions for weight validation
  const getRemainingWeight = () => {
    if (!selectedManager || !quarterlyWeights[objectiveData.quarter]) {
      return 100; // Default to 100% if no data
    }
    
    // If editing, add back the current objective's weight to the available weight
    let available = quarterlyWeights[objectiveData.quarter].available || 0;
    if (selectedObjective) {
      available += Math.round(selectedObjective.weight);
    }
    
    return Math.round(available);
  };

  const isWeightValid = () => {
    return objectiveData.weight <= getRemainingWeight();
  };

  const formatStatusText = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const loadCompletedObjectives = async (seniorManagerId: string) => {
    setLoading(true);
    try {
      console.log('Loading completed objectives for senior manager:', seniorManagerId);
      
      // Fetch completed manager objectives that need senior management review
      const response = await fetch('/api/senior-management/objectives?status=completed');

      console.log('Response status for objectives:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Error response for objectives:', errorData);
        throw new Error(`Failed to fetch objectives: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Objectives data received:', data);
      setCompletedObjectives(data.completed || []);
      setReviewedObjectives(data.reviewed || []);
    } catch (error) {
      console.error('Error loading completed objectives:', error);
      setCompletedObjectives([]);
      setReviewedObjectives([]);
    } finally {
      setLoading(false);
    }
  };

  const loadManagers = async () => {
    try {
      console.log('Loading subordinate managers for senior manager:', user?.id);
      
      // Load subordinate managers (managers under this senior manager)
      const response = await fetch(`/api/senior-management/team?seniorManagerId=${user?.id}`);

      console.log('Response status for subordinate managers:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Error response for subordinate managers:', errorData);
        throw new Error(`Failed to fetch subordinate managers: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Subordinate managers data received:', data);
      
      if (data.success && data.subordinateManagers) {
        console.log(`Found ${data.subordinateManagers.length} subordinate managers`);
        setManagers(data.subordinateManagers);
      } else {
        console.log('No subordinate managers found or API error:', data.error);
        setManagers([]);
      }
    } catch (error) {
      console.error('Error loading subordinate managers:', error);
      setManagers([]);
    }
  };

  const loadAssignedObjectives = async () => {
    try {
      console.log('Loading assigned objectives for senior manager:', user?.id);
      
      const response = await fetch(`/api/senior-management/assigned-objectives?seniorManagerId=${user?.id}`);

      console.log('Response status for assigned objectives:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.text();
        console.log('Error response for assigned objectives:', errorData);
        throw new Error(`Failed to fetch assigned objectives: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Assigned objectives data received:', data);
      setAssignedObjectives(data.objectives || []);
    } catch (error) {
      console.error('Error loading assigned objectives:', error);
      setAssignedObjectives([]);
    }
  };

  const loadManagerQuarterlyWeights = async (managerId: string, year: number) => {
    if (!managerId) return;
    
    setLoadingWeights(true);
    try {
      const response = await fetch(`/api/senior-management/quarterly-weights?managerId=${managerId}&year=${year}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quarterly weights');
      }

      const data = await response.json();
      setQuarterlyWeights(data.quarterlyWeights || {});
    } catch (error) {
      console.error('Error loading quarterly weights:', error);
      setQuarterlyWeights({});
    } finally {
      setLoadingWeights(false);
    }
  };



  const generateIndividualAIScore = async (objective: ManagerObjective) => {
    setAiScoringInProgress(prev => ({ ...prev, [objective.id]: true }));
    try {
      // Call manager AI scoring API with proper parameters
      const response = await fetch('/api/manager/ai-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          objectiveId: objective.id,
          title: objective.title,
          description: objective.description,
          target: objective.target,
          current: objective.current,
          weight: objective.weight,
          employeeName: objective.managerName || 'Manager',
          employeeRemarks: objective.managerRemarks || ''
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate AI score');
      }

      const aiResult = await response.json();
      
      const scoredObjective = {
        ...objective,
        aiScore: aiResult.score,
        aiComments: aiResult.explanation,
        status: 'AI_SCORED',
        seniorManagerScore: aiResult.score, // Default to AI score
        seniorManagerComments: '',
        finalScore: aiResult.score
      };

      // Move from completed to reviewed
      setCompletedObjectives(prev => prev.filter(obj => obj.id !== objective.id));
      setReviewedObjectives(prev => [...prev, scoredObjective]);
      
      alert(`AI scoring completed for "${objective.title}"! Score: ${aiResult.score}/10`);
    } catch (error) {
      console.error('Error in AI scoring:', error);
      alert('Error generating AI score. Please try again.');
    } finally {
      setAiScoringInProgress(prev => ({ ...prev, [objective.id]: false }));
    }
  };

  const updateObjectiveReview = async (objectiveId: string, field: string, value: any) => {
    // Update local state immediately for responsive UI
    setReviewedObjectives(prev => 
      prev.map(obj => {
        if (obj.id === objectiveId) {
          const updatedObj = { ...obj, [field]: value };
          
          // Auto-logic: When senior manager score is set, make it the final score
          if (field === 'seniorManagerScore' && value) {
            updatedObj.finalScore = value;
          }
          
          return updatedObj;
        }
        return obj;
      })
    );

    // Get the updated objective for validation and saving
    const objective = reviewedObjectives.find(obj => obj.id === objectiveId);
    if (objective) {
      const updatedObjective = { ...objective, [field]: value };
      
      // Auto-update final score if senior manager score is being set
      if (field === 'seniorManagerScore' && value) {
        updatedObjective.finalScore = value;
      }
      
      // Validation: Check if override requires justification
      const isOverride = updatedObjective.seniorManagerScore && 
                        updatedObjective.aiScore && 
                        updatedObjective.seniorManagerScore !== updatedObjective.aiScore;
      
      // Save to backend if review is complete
      const hasRequiredFields = updatedObjective.seniorManagerScore && updatedObjective.finalScore;
      const hasJustificationIfNeeded = !isOverride || (isOverride && updatedObjective.seniorManagerComments?.trim());
      
      if (hasRequiredFields && hasJustificationIfNeeded) {
        try {
          const response = await fetch('/api/senior-management/review-manager-objectives', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
            },
            body: JSON.stringify({
              objectiveId: objectiveId,
              seniorManagerScore: updatedObjective.seniorManagerScore,
              seniorManagerComments: updatedObjective.seniorManagerComments,
              finalScore: updatedObjective.finalScore,
              isOverride: isOverride,
              aiScoreOverridden: isOverride ? updatedObjective.aiScore : null
            })
          });

          if (response.ok) {
            console.log(`✅ Review saved for objective: ${updatedObjective.title}${isOverride ? ' (Override applied)' : ''}`);
          }
        } catch (error) {
          console.error('Error saving review:', error);
        }
      }
    }
  };

  const handleIndividualSubmission = async (objective: ManagerObjective) => {
    // Set the objective to be submitted and show modal
    setSelectedObjective(objective);
    setIndividualSignature('');
    setShowIndividualSubmissionModal(true);
  };

  const submitIndividualObjective = async () => {
    if (!selectedObjective || !individualSignature.trim()) {
      alert('Digital signature is required');
      return;
    }

    // Enhanced validation
    const hasScore = selectedObjective.seniorManagerScore || selectedObjective.aiScore;
    const finalScore = selectedObjective.finalScore || selectedObjective.seniorManagerScore || selectedObjective.aiScore;
    const isOverride = selectedObjective.seniorManagerScore && selectedObjective.aiScore && 
                      selectedObjective.seniorManagerScore !== selectedObjective.aiScore;
    const hasJustification = selectedObjective.seniorManagerComments?.trim();

    if (!hasScore) {
      alert('Incomplete Review!\n\nPlease ensure the objective has a score (AI or senior manager override) before submitting.');
      return;
    }

    if (!finalScore) {
      alert('Missing Final Score!\n\nPlease ensure the objective has a final score before submitting.');
      return;
    }

    if (isOverride && !hasJustification) {
      alert('Override Justification Required!\n\nThis objective has an overridden AI score but lacks justification comments.\n\nPlease provide justification before submitting to HR.');
      return;
    }

    // Ensure we have the final score set locally before submission
    if (!selectedObjective.finalScore) {
      selectedObjective.finalScore = finalScore;
    }

    setIndividualSubmitting(prev => ({ ...prev, [selectedObjective.id]: true }));
    
    try {
      console.log('Submitting individual objective:', {
        objectiveId: selectedObjective.id,
        hasScore,
        finalScore,
        isOverride,
        hasJustification,
        seniorManagerScore: selectedObjective.seniorManagerScore,
        aiScore: selectedObjective.aiScore,
        currentFinalScore: selectedObjective.finalScore
      });

      // First, save the review data to ensure the objective is in the correct state
      const saveReviewResponse = await fetch('/api/senior-management/review-objectives', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          objectiveId: selectedObjective.id,
          seniorManagerScore: selectedObjective.seniorManagerScore,
          seniorManagerComments: selectedObjective.seniorManagerComments,
          finalScore: selectedObjective.finalScore || selectedObjective.seniorManagerScore || selectedObjective.aiScore,
          status: 'reviewed'
        })
      });

      if (!saveReviewResponse.ok) {
        console.error('Failed to save review data');
        // Continue anyway, as the data might already be saved
      }

      // Then submit to HR
      const response = await fetch('/api/senior-management/review-manager-objectives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          objectiveIds: [selectedObjective.id],
          seniorManagerId: user?.id,
          seniorDigitalSignature: individualSignature.trim(),
          submissionNotes: `Individual submission: ${selectedObjective.title}${isOverride ? ' (AI Score Override Applied)' : ''}`,
          individualSubmission: true,
          reviewData: {
            seniorManagerScore: selectedObjective.seniorManagerScore,
            seniorManagerComments: selectedObjective.seniorManagerComments,
            finalScore: selectedObjective.finalScore || selectedObjective.seniorManagerScore || selectedObjective.aiScore,
            isOverride: isOverride,
            aiScoreOverridden: isOverride ? selectedObjective.aiScore : null
          }
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to submit to HR'}`);
      }

      const result = await response.json();
      console.log('Submission result:', result);
      
      if (result.success) {
        // Remove from reviewed objectives as it's now with HR
        setReviewedObjectives(prev => prev.filter(obj => obj.id !== selectedObjective.id));
        
        alert(`Successfully submitted "${selectedObjective.title}" to HR for bonus approval!\n\n` +
              `Manager: ${selectedObjective.managerName}\n` +
              `Final Score: ${selectedObjective.finalScore}/10\n` +
              `${isOverride ? `Override Applied: AI ${selectedObjective.aiScore} → Senior Manager ${selectedObjective.seniorManagerScore}\n` : ''}` +
              `Bonus Amount: $${result.bonusAmount?.toFixed(2) || '0.00'}`);
        
        // Close modal and reset form
        setShowIndividualSubmissionModal(false);
        setIndividualSignature('');
        setSelectedObjective(null);
      } else {
        throw new Error(result.error || 'Failed to submit to HR');
      }
      
    } catch (error) {
      console.error('Error submitting individual objective to HR:', error);
      alert(`Error submitting to HR: ${error instanceof Error ? error.message : 'Please try again.'}`);
    } finally {
      setIndividualSubmitting(prev => ({ ...prev, [selectedObjective.id]: false }));
    }
  };

  const submitToHR = async () => {
    if (!seniorSignature.trim()) {
      alert('Digital signature is required');
      return;
    }

    // Enhanced validation for override justifications
    const invalidReviews = reviewedObjectives.filter(obj => {
      const hasScore = obj.seniorManagerScore && obj.finalScore;
      const isOverride = obj.seniorManagerScore && obj.aiScore && obj.seniorManagerScore !== obj.aiScore;
      const hasJustificationIfNeeded = !isOverride || (isOverride && obj.seniorManagerComments?.trim());
      
      return !hasScore || !hasJustificationIfNeeded;
    });

    if (invalidReviews.length > 0) {
      const overrideIssues = invalidReviews.filter(obj => 
        obj.seniorManagerScore && obj.aiScore && obj.seniorManagerScore !== obj.aiScore && !obj.seniorManagerComments?.trim()
      );
      
      if (overrideIssues.length > 0) {
        alert(`Override Justification Required!\n\n${overrideIssues.length} objective(s) have overridden AI scores but lack justification comments.\n\nPlease provide justification for all score overrides before submitting to HR.`);
      } else {
        alert(`Incomplete Reviews!\n\n${invalidReviews.length} objective(s) need to be completed with scores and comments.`);
      }
      return;
    }

    setSubmitting(true);
    try {
      // Submit to HR via actual API
      const objectiveIds = reviewedObjectives.map(obj => obj.id);
      
      const response = await fetch('/api/senior-management/review-manager-objectives', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify({
          objectiveIds: objectiveIds,
          seniorDigitalSignature: seniorSignature,
          submissionNotes: submissionNotes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to submit to HR');
      }

      const result = await response.json();
      
      alert(`Successfully submitted ${result.results.length} manager objectives to HR for bonus approval!\nTotal bonus amount: $${result.totalBonusAmount.toFixed(2)}`);
      setShowSubmissionModal(false);
      setSeniorSignature('');
      setSubmissionNotes('');
      
      // Clear reviewed objectives as they're now with HR
      setReviewedObjectives([]);
      
      // Reload to get updated status
      if (user) {
        loadCompletedObjectives(user.id);
      }
    } catch (error) {
      console.error('Error submitting to HR:', error);
      alert('Error submitting to HR. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignObjective = async () => {
    if (!selectedManager || !objectiveData.title.trim() || !objectiveData.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    // Additional validation for quantitative objectives
    if (objectiveData.objectiveType === 'quantitative') {
      if (practiceRevenues.length === 0 || practiceRevenues.some(p => !p.practiceName || !p.targetRevenue || !p.weight)) {
        alert('Please add at least one complete practice revenue entry with weight');
        return;
      }
      
      // Validate that practice weights sum to objective weight
      const totalPracticeWeight = practiceRevenues.reduce((sum, p) => sum + (parseFloat(String(p.weight)) || 0), 0);
      const objectiveWeight = parseFloat(String(objectiveData.weight || '0'));
      
      if (Math.abs(totalPracticeWeight - objectiveWeight) >= 0.01) {
        alert(`Weight Mismatch!\n\nPractice weights (${totalPracticeWeight.toFixed(1)}%) must sum to exactly the objective weight (${objectiveWeight.toFixed(1)}%).\n\nPlease adjust practice weights before submitting.`);
        return;
      }
    }

    setIsAssigning(true);
    try {
      const manager = managers.find(m => m.id === selectedManager);
      if (!manager) {
        alert('Manager not found');
        return;
      }

      const isEditing = selectedObjective !== null;

      // Use different endpoints for qualitative vs quantitative
      const method = isEditing ? 'PUT' : 'POST';
      const endpoint = objectiveData.objectiveType === 'quantitative'
        ? isEditing 
          ? `/api/senior-management/quantitative-objectives/${selectedObjective.id}`
          : '/api/senior-management/quantitative-objectives'
        : isEditing 
          ? `/api/senior-management/assign-objective/${selectedObjective.id}`
          : '/api/senior-management/assign-objective';

      // Build request body based on objective type
      const requestBody = objectiveData.objectiveType === 'quantitative'
        ? {
            managerId: selectedManager,
            seniorManagerId: user?.id,
            title: objectiveData.title,
            description: objectiveData.description,
            quarter: objectiveData.quarter,
            year: objectiveData.year,
            dueDate: objectiveData.dueDate,
            weight: objectiveData.weight,
            practiceRevenues: practiceRevenues.map(p => ({
              practiceName: p.practiceName,
              targetRevenue: p.targetRevenue,
              weight: p.weight,
            })),
          }
        : {
            managerId: selectedManager,
            ...objectiveData,
            assignedBy: user?.id,
            assignedDate: new Date().toISOString()
          };

      console.log(`${objectiveData.objectiveType === 'quantitative' ? 'Quantitative' : 'Qualitative'} Objective:`, endpoint, requestBody);

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        try {
          const errorData = await response.json();
          if (errorData.details && errorData.details.quarter) {
            // Handle weight validation error specifically
            const { quarter, currentAllocated, requestedWeight, available, exceedsBy } = errorData.details;
            alert(`Weight Allocation Error:\n\n` +
                  `Current allocated: ${currentAllocated}%\n` +
                  `Requested: ${requestedWeight}%\n` +
                  `Available: ${available}%\n` +
                  `Exceeds by: ${exceedsBy}%\n\n` +
                  `Please reduce the weight or choose a different quarter.`);
          } else {
            alert(`${errorData.error || 'Failed to save objective'}`);
          }
        } catch (parseError) {
          // Response is not JSON, show status and text
          const statusText = response.status === 405 ? 'Method Not Allowed' : response.statusText;
          alert(`Error ${response.status}: ${statusText}\n\nPlease try again or contact support.`);
          console.error('Response parsing error:', parseError, 'Status:', response.status);
        }
        return;
      }

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        alert(`Invalid response from server. Please try again.`);
        console.error('Failed to parse success response:', parseError);
        return;
      }
      
      if (result.success) {
        const displayType = objectiveData.objectiveType === 'quantitative' ? 'quantitative' : 'qualitative';
        alert(`${displayType} objective successfully ${isEditing ? 'updated' : 'assigned'} ${isEditing ? '' : `to ${manager.name}!`}`);
        setShowAssignModal(false);
        resetAssignmentForm();
        setSelectedObjective(null);
        loadAssignedObjectives();
        // Refresh quarterly weights after successful assignment
        if (selectedManager) {
          loadManagerQuarterlyWeights(selectedManager, objectiveData.year);
        }
      } else {
        alert('Failed to save objective. Please try again.');
      }
    } catch (error) {
      console.error('Error saving objective:', error);
      alert('Error saving objective. Please try again.');
    } finally {
      setIsAssigning(false);
    }
  };

  const resetAssignmentForm = () => {
    setObjectiveData({
      title: '',
      description: '',
      category: 'performance',
      target: '',
      weight: defaultWeightage,
      dueDate: '',
      quarter: `Q${Math.ceil((new Date().getMonth() + 1) / 3)}`,
      year: new Date().getFullYear(),
      objectiveType: 'qualitative',
      isQuantitative: false
    });
    setSelectedManager('');
    setPracticeRevenues([]); // Clear practice revenues
  };

  const handleViewDetails = (objective: ManagerObjective) => {
    setSelectedObjective(objective);
    setShowDetailsModal(true);
  };

  if (authLoading || loading) {
    return <LoadingSpinner message="Loading manager objectives..." />;
  }

  if (!user || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to continue</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Unified Header Section */}
      <div className="bg-white/95 backdrop-blur-xl border-b border-gray-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col py-6">
            <h1 className="text-3xl font-bold text-[#333333] mb-1">Review Manager Objectives</h1>
            <p className="text-gray-500 text-base max-w-2xl">Review, score, and approve completed manager objectives</p>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Buttons Section */}
        <div className="mb-8">

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-[#004E9E] text-[#004E9E]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending Review ({completedObjectives.length})
              </button>
              <button
                onClick={() => setActiveTab('reviewed')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reviewed'
                    ? 'border-[#004E9E] text-[#004E9E]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Reviewed ({reviewedObjectives.length})
              </button>
              <button
                onClick={() => setActiveTab('assign')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'assign'
                    ? 'border-[#004E9E] text-[#004E9E]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Assign to Managers ({assignedObjectives.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Objectives Content */}
        {activeTab === 'pending' && (
          <div className="space-y-6">
            {completedObjectives.length > 0 ? (
              completedObjectives.map((objective) => (
                <div key={objective.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{objective.title}</h3>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircleIcon className="h-3 w-3 mr-1" />
                          Completed
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {objective.category}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-3">{objective.description}</p>
                      
                      {/* Manager Info */}
                      <div className="flex items-center space-x-2 mb-3">
                        <UserIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          <span className="font-medium">{objective.managerName}</span> • {objective.managerTitle}
                        </span>
                      </div>

                      {/* Progress */}
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Achievement</span>
                          <span className="font-medium text-gray-900">{Math.round(objective.progress)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" 
                            style={{ width: `${Math.min(100, objective.progress)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span>Achieved: {objective.current}</span>
                          <span>Target: {objective.target}</span>
                        </div>
                      </div>

                      {/* Manager's Submission */}
                      {objective.managerRemarks && (
                        <div className="bg-blue-50 p-4 rounded-lg mb-3">
                          <h5 className="text-sm font-medium text-blue-900 mb-2">Manager's Comments:</h5>
                          <p className="text-sm text-blue-800">{objective.managerRemarks}</p>
                          {objective.managerEvidence && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-blue-900">Supporting Evidence:</p>
                              <p className="text-xs text-blue-700">{objective.managerEvidence}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => handleViewDetails(objective)}
                        className="flex items-center space-x-1 px-3 py-1.5 text-sm font-medium text-[#004E9E] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <EyeIcon className="h-4 w-4" />
                        <span>Review</span>
                      </button>
                      <button
                        onClick={() => generateIndividualAIScore(objective)}
                        disabled={aiScoringInProgress[objective.id]}
                        className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-xl hover:from-purple-600 hover:via-pink-600 hover:to-indigo-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        {aiScoringInProgress[objective.id] ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>Scoring...</span>
                          </>
                        ) : (
                          <>
                            <SparklesIcon className="h-4 w-4 animate-pulse" />
                            <span>AI Score</span>
                            <CpuChipIcon className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      <span>Due: {new Date(objective.dueDate).toLocaleDateString()}</span>
                      <span>Weight: {Math.round(objective.weight)}%</span>
                      <span>Completed: {objective.completedAt ? new Date(objective.completedAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                <CheckCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No pending reviews</h3>
                <p className="mt-1 text-sm text-gray-500">
                  All completed manager objectives have been reviewed.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviewed' && (
          <div className="space-y-6">
            {reviewedObjectives.length > 0 ? (
              reviewedObjectives.map((objective) => (
                <div key={objective.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{objective.title}</h3>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <StarIcon className="h-3 w-3 mr-1" />
                          Reviewed
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {objective.category}
                        </span>
                      </div>

                      {/* Manager Info */}
                      <div className="flex items-center space-x-2 mb-3">
                        <UserIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          <span className="font-medium">{objective.managerName}</span> • {objective.managerTitle}
                        </span>
                      </div>

                      {/* AI Score */}
                      {objective.aiScore && (
                        <div className="bg-purple-50 p-4 rounded-lg mb-3">
                          <div className="flex items-center space-x-2 mb-2">
                            <CpuChipIcon className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium text-purple-900">AI Analysis Score: {Math.round(objective.aiScore)}/10</span>
                          </div>
                          <p className="text-sm text-purple-800">{objective.aiComments}</p>
                        </div>
                      )}

                      {/* Compact Senior Manager Review */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 mb-4 shadow-sm">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="p-2 bg-[#004E9E] rounded-lg">
                            <PencilIcon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h5 className="font-semibold text-[#004E9E]">Senior Manager Review</h5>
                            <p className="text-xs text-blue-700">Override AI scoring if necessary</p>
                          </div>
                        </div>
                        
                        {/* Compact AI Score Override Section */}
                        <div className="mb-4 p-4 bg-white rounded-lg border border-blue-100">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <CpuChipIcon className="h-4 w-4 text-purple-600" />
                              <span className="text-sm font-medium text-gray-900">AI Score Override</span>
                            </div>
                            <span className="text-xs bg-purple-100 px-2 py-1 rounded-full text-purple-800">
                              AI: {objective.aiScore || 0}/10
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Override Score (0-10)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                value={objective.seniorManagerScore || ''}
                                onChange={(e) => {
                                  const score = Number(e.target.value);
                                  updateObjectiveReview(objective.id, 'seniorManagerScore', score);
                                  updateObjectiveReview(objective.id, 'finalScore', score);
                                }}
                                placeholder={`AI: ${objective.aiScore || 0}`}
                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#004E9E] focus:border-[#004E9E]"
                              />
                            </div>
                            <div className="flex items-center">
                              {objective.seniorManagerScore && objective.aiScore && objective.seniorManagerScore !== objective.aiScore ? (
                                <div className={`text-xs px-3 py-2 rounded-lg font-medium ${
                                  objective.seniorManagerScore > objective.aiScore 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {objective.seniorManagerScore > objective.aiScore ? '↗' : '↘'} 
                                  Override: {Math.abs(objective.seniorManagerScore - objective.aiScore).toFixed(1)}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-500">No override</span>
                              )}
                            </div>
                          </div>

                          {/* Compact Override Justification */}
                          {objective.seniorManagerScore && objective.aiScore && objective.seniorManagerScore !== objective.aiScore && (
                            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                              <label className="block text-xs font-medium text-amber-800 mb-2">
                                <ExclamationTriangleIcon className="h-3 w-3 inline mr-1" />
                                Override Justification Required *
                              </label>
                              <textarea
                                value={objective.seniorManagerComments || ''}
                                onChange={(e) => updateObjectiveReview(objective.id, 'seniorManagerComments', e.target.value)}
                                placeholder="Justify override decision..."
                                rows={2}
                                className="w-full px-3 py-2 text-sm border border-amber-200 rounded-lg focus:ring-1 focus:ring-amber-500 resize-none"
                              />
                            </div>
                          )}
                        </div>

                        {/* Compact Final Score Display */}
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200 mb-3">
                          <div className="flex items-center space-x-2">
                            <StarIcon className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium text-green-900">Final Score:</span>
                          </div>
                          <span className="text-lg font-bold text-green-900">
                            {objective.finalScore || objective.seniorManagerScore || objective.aiScore || 0}/10
                          </span>
                        </div>

                        {/* Compact Additional Comments */}
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">
                            Additional Comments (Optional)
                          </label>
                          <textarea
                            value={objective.seniorManagerComments || ''}
                            onChange={(e) => updateObjectiveReview(objective.id, 'seniorManagerComments', e.target.value)}
                            placeholder="Add review comments..."
                            rows={2}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-[#004E9E] resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Submit to HR Section */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-xs">
                            Status: {(() => {
                              // Check if score exists
                              if (!objective.seniorManagerScore && !objective.aiScore) {
                                return (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                                    <ClockIcon className="h-3 w-3 mr-1" />
                                    No Score
                                  </span>
                                );
                              }
                              
                              // Check for override without justification
                              const isOverride = objective.seniorManagerScore && objective.aiScore && 
                                               objective.seniorManagerScore !== objective.aiScore;
                              const hasJustification = objective.seniorManagerComments?.trim();
                              
                              if (isOverride && !hasJustification) {
                                return (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                                    <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                                    Not Ready
                                  </span>
                                );
                              }
                              
                              // Check if ready for submission
                              if (objective.finalScore && (objective.seniorManagerScore || objective.aiScore)) {
                                return (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                                    Ready
                                  </span>
                                );
                              }
                              
                              return (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-amber-100 text-amber-800">
                                  <ClockIcon className="h-3 w-3 mr-1" />
                                  Incomplete
                                </span>
                              );
                            })()}
                          </div>
                        </div>
                        
                        <div>
                          {(() => {
                            // Check readiness for submission
                            const hasScore = objective.seniorManagerScore || objective.aiScore;
                            const hasFinalScore = objective.finalScore;
                            const isOverride = objective.seniorManagerScore && objective.aiScore && 
                                             objective.seniorManagerScore !== objective.aiScore;
                            const hasJustification = objective.seniorManagerComments?.trim();
                            const isReady = hasScore && hasFinalScore && (!isOverride || hasJustification);

                            if (isReady) {
                              return (
                                <button
                                  onClick={() => handleIndividualSubmission(objective)}
                                  disabled={individualSubmitting[objective.id] || submitting}
                                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#004E9E] to-[#007BFF] hover:from-[#003D7C] hover:to-[#0056B3] text-white text-sm font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                                >
                                  {individualSubmitting[objective.id] ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      <span>Submitting...</span>
                                    </>
                                  ) : (
                                    <>
                                      <HandThumbUpIcon className="h-4 w-4 mr-2" />
                                      <span>Submit to HR</span>
                                      <div className="ml-2 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                                    </>
                                  )}
                                </button>
                              );
                            } else {
                              // Show appropriate message based on what's missing
                              let message = 'Complete review';
                              if (!hasScore) message = 'Score required';
                              else if (!hasFinalScore) message = 'Final score required';
                              else if (isOverride && !hasJustification) message = 'Override justification required';
                              
                              return (
                                <div className="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-lg border">
                                  {message}
                                </div>
                              );
                            }
                          })()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                <StarIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No reviewed objectives</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Objectives will appear here after AI scoring and review.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'assign' && (
          <div className="space-y-6">
            {/* Assignment Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedObjective ? 'Edit Objective' : 'Assign Objectives to Managers'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedObjective 
                      ? 'Update the objective details and weight allocation' 
                      : 'Select a manager and create custom objectives with 100% quarterly weight pool allocation'}
                  </p>
                </div>
              </div>

              {/* Manager Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Subordinate Manager
                </label>
                {managers.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {managers.map((manager) => (
                    <div
                      key={manager.id}
                      onClick={() => {
                        setSelectedManager(manager.id);
                        loadManagerQuarterlyWeights(manager.id, objectiveData.year);
                      }}
                      className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedManager === manager.id
                          ? 'border-[#004E9E] bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#004E9E] to-[#007BFF] flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {manager.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{manager.name}</h4>
                          <p className="text-xs text-gray-500">{manager.role}</p>
                          <div className="flex items-center mt-1 space-x-2">
                            <span className="text-xs text-gray-400">
                              {manager.teamSize || 0} team members
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-400">
                              {manager.objectivesCount || 0} objectives
                            </span>
                            <span className="text-xs text-gray-400">•</span>
                            <span className="text-xs text-gray-400">
                              {manager.completionRate || 0}% complete
                            </span>
                          </div>
                        </div>
                        {selectedManager === manager.id && (
                          <div className="text-[#004E9E]">
                            <CheckCircleIcon className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No subordinate managers found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      You don't have any managers reporting to you, or they haven't been assigned yet.
                    </p>
                  </div>
                )}
              </div>

              {/* Create Objective Button */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {selectedManager 
                        ? `Ready to create objective for ${managers.find(m => m.id === selectedManager)?.name}`
                        : 'Select a manager to create an objective'
                      }
                    </h4>
                    <p className="text-sm text-gray-500">Click the button to open the objective creation form</p>
                  </div>
                  <button
                    onClick={() => setShowAssignModal(true)}
                    disabled={!selectedManager}
                    className={`px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-all ${
                      selectedManager
                        ? 'bg-gradient-to-r from-[#004E9E] to-[#007BFF] text-white hover:shadow-lg'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <PlusIcon className="h-5 w-5" />
                    <span>Create Custom Objective</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Assigned Objectives List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Previously Assigned Objectives</h3>
              
              {assignedObjectives.length > 0 ? (
                <div className="space-y-4">
                  {assignedObjectives.map((objective) => (
                    <div key={objective.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium text-gray-900">{objective.title}</h4>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {objective.category}
                            </span>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {formatStatusText(objective.status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{objective.description}</p>
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <UserIcon className="h-4 w-4" />
                              <span>{objective.managerName}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <CalendarIcon className="h-4 w-4" />
                              <span>Due: {new Date(objective.dueDate).toLocaleDateString()}</span>
                            </div>
                            <span>Weight: {Math.round(objective.weight)}%</span>
                            <span>Target: {objective.target}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {['ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].includes(objective.status) && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedObjective(objective);
                                  setShowAssignModal(true);
                                }}
                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit Objective"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => {
                                  // TODO: Implement remind functionality
                                  alert('Remind functionality coming soon');
                                }}
                                className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                title="Remind Manager"
                              >
                                <BellIcon className="h-5 w-5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h4 className="mt-2 text-sm font-medium text-gray-900">No objectives assigned</h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Select a manager and create an objective to get started.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-8 border w-11/12 max-w-5xl shadow-2xl rounded-xl bg-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedObjective ? 'Edit Manager Objective' : 'Create Manager Objective'}
                </h3>
                {selectedManager && (
                  <p className="text-sm text-gray-500 mt-1">
                    for {managers.find(m => m.id === selectedManager)?.name} ({managers.find(m => m.id === selectedManager)?.title})
                  </p>
                )}
              </div>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  resetAssignmentForm();
                  setSelectedObjective(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

           
            {/* Objective Type Selector */}
            <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Objective Type *
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setObjectiveData({ ...objectiveData, objectiveType: 'qualitative', isQuantitative: false })}
                  className={`p-4 rounded-lg border transition-all ${
                    objectiveData.objectiveType === 'qualitative'
                      ? 'border-[#004E9E] bg-blue-50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  <div className="text-center">
                    <DocumentTextIcon className="h-8 w-8 text-gray-600 mb-2 mx-auto" />
                    <h4 className={`font-semibold ${objectiveData.objectiveType === 'qualitative' ? 'text-[#004E9E]' : 'text-gray-700'}`}>
                      Qualitative
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Performance, Leadership, Innovation
                    </p>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setObjectiveData({ ...objectiveData, objectiveType: 'quantitative', isQuantitative: true });
                    // Initialize practice revenues if empty
                    if (practiceRevenues.length === 0) {
                      setPracticeRevenues([{
                        id: Date.now().toString(),
                        practiceName: '',
                        targetRevenue: '',
                        achievedRevenue: '0',
                        weight: ''
                      }]);
                    }
                  }}
                  className={`p-4 rounded-lg border transition-all ${
                    objectiveData.objectiveType === 'quantitative'
                      ? 'border-[#004E9E] bg-blue-50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  <div className="text-center">
                    <CurrencyDollarIcon className="h-8 w-8 text-gray-600 mb-2 mx-auto" />
                    <h4 className={`font-semibold ${objectiveData.objectiveType === 'quantitative' ? 'text-[#004E9E]' : 'text-gray-700'}`}>
                      Quantitative 
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      Practice-based Quantitative Objectives 
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Conditional Form based on Objective Type */}
            {objectiveData.objectiveType === 'qualitative' ? (
              // QUALITATIVE FORM (Existing)
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Basic Information */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 border-b pb-2">Basic Information</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Objective Title *
                    </label>
                    <input
                      type="text"
                      value={objectiveData.title}
                      onChange={(e) => setObjectiveData({ ...objectiveData, title: e.target.value })}
                      placeholder="e.g., Improve Team Performance"
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <div className="relative">
                      <textarea
                        value={objectiveData.description}
                        onChange={(e) => setObjectiveData({ ...objectiveData, description: e.target.value })}
                        placeholder="Detailed description of what needs to be achieved..."
                        rows={4}
                        className="w-full pr-12 border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                      />
                      <button
                        type="button"
                        className="absolute top-2 right-2 p-2 text-gray-400 hover:text-[#004E9E] hover:bg-gray-100 rounded-md transition-colors"
                        title="Voice input (Coming soon)"
                      >
                        <MicrophoneIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={objectiveData.category}
                      onChange={(e) => setObjectiveData({ ...objectiveData, category: e.target.value })}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                    >
                      <option value="performance"> Performance</option>
                      <option value="revenue"> Revenue</option>
                      <option value="efficiency"> Efficiency</option>
                      <option value="customer"> Customer</option>
                      <option value="development"> Development</option>
                      <option value="leadership"> Leadership</option>
                      <option value="innovation"> Innovation</option>
                      <option value="collaboration"> Collaboration</option>
                      <option value="quality"> Quality</option>
                    </select>
                  </div>
                </div>

                {/* Right Column - Metrics & Timeline */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 border-b pb-2">Metrics & Timeline</h4>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Value/Score *
                    </label>
                    <input
                      type="number"
                      value={objectiveData.target}
                      onChange={(e) => setObjectiveData({ ...objectiveData, target: e.target.value })}
                      placeholder="e.g., 95 (for 95% satisfaction)"
                      min="1"
                      max="1000"
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                    />
                    <p className="text-xs text-gray-500 mt-1">The target value the manager should achieve</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (%) - {objectiveData.quarter} {objectiveData.year}
                      <span className="text-xs text-gray-500 ml-1">(Default: {defaultWeightage}%)</span>
                    </label>
                    <input
                      type="range"
                      value={objectiveData.weight}
                      onChange={(e) => setObjectiveData({ ...objectiveData, weight: parseInt(e.target.value) })}
                      min="5"
                      max={Math.max(5, getRemainingWeight())}
                      disabled={getRemainingWeight() === 0 || loadingWeights}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>5%</span>
                      <span className="font-medium text-[#004E9E]">{objectiveData.weight}%</span>
                      <span>{getRemainingWeight()}% max</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {loadingWeights ? 'Checking available weight...' :
                        getRemainingWeight() === 0 ? 'No weight left for this quarter.' :
                        selectedObjective 
                          ? `You can assign up to ${getRemainingWeight()}% for ${objectiveData.quarter}. (This objective can be adjusted independently)`
                          : `You can assign up to ${getRemainingWeight()}% more for ${objectiveData.quarter}. (${Math.round(quarterlyWeights[objectiveData.quarter]?.allocated || 0)}% already assigned)`}
                    </p>
                    
                    {/* Quarterly Weight Overview */}
                    {quarterlyWeights && !loadingWeights && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <h5 className="text-xs font-medium text-gray-700 mb-2">Weight Allocation Overview - {objectiveData.year}</h5>
                        <div className="grid grid-cols-4 gap-2">
                          {Object.entries(quarterlyWeights).length > 0 ? (
                            ['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => {
                              const info = quarterlyWeights[quarter] || { allocated: 0, available: 100 };
                              return (
                                <div key={quarter} className="text-center">
                                  <div className={`text-xs font-medium ${quarter === objectiveData.quarter ? 'text-[#004E9E]' : 'text-gray-600'}`}>
                                    {quarter}
                                  </div>
                                  <div className={`text-xs ${quarter === objectiveData.quarter ? 'text-[#004E9E]' : 'text-gray-500'}`}>
                                    {Math.round(info.allocated)}% used
                                  </div>
                                  <div className={`text-xs ${quarter === objectiveData.quarter ? 'text-[#004E9E]' : 'text-gray-400'}`}>
                                    {Math.round(info.available)}% left
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            ['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => (
                              <div key={quarter} className="text-center">
                                <div className={`text-xs font-medium ${quarter === objectiveData.quarter ? 'text-[#004E9E]' : 'text-gray-600'}`}>
                                  {quarter}
                                </div>
                                <div className={`text-xs ${quarter === objectiveData.quarter ? 'text-[#004E9E]' : 'text-gray-500'}`}>
                                  0% used
                                </div>
                                <div className={`text-xs ${quarter === objectiveData.quarter ? 'text-[#004E9E]' : 'text-gray-400'}`}>
                                  100% left
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quarter</label>
                      <select
                        value={objectiveData.quarter}
                        onChange={(e) => {
                          setObjectiveData({ ...objectiveData, quarter: e.target.value });
                          if (selectedManager) {
                            loadManagerQuarterlyWeights(selectedManager, objectiveData.year);
                          }
                        }}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                      >
                        <option value="Q1">Q1 - Jan-Mar</option>
                        <option value="Q2">Q2 - Apr-Jun</option>
                        <option value="Q3">Q3 - Jul-Sep</option>
                        <option value="Q4">Q4 - Oct-Dec</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                      <select
                        value={objectiveData.year}
                        onChange={(e) => setObjectiveData({ ...objectiveData, year: Number(e.target.value) })}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                      >
                        <option value={2024}>2024</option>
                        <option value={2025}>2025</option>
                        <option value={2026}>2026</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                    <input
                      type="date"
                      value={objectiveData.dueDate}
                      onChange={(e) => setObjectiveData({ ...objectiveData, dueDate: e.target.value })}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                    />
                  </div>
                </div>
              </div>
            ) : (
              // QUANTITATIVE FORM (New - Revenue-based)
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Objective Title *
                    </label>
                    <select
                      value={objectiveData.title}
                      onChange={(e) => setObjectiveData({ ...objectiveData, title: e.target.value })}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                    >
                      <option value="">Select objective type...</option>
                      <option value="Revenue">Revenue</option>
                      <option value="New clients">New clients</option>
                      <option value="AR target">AR target</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description *
                    </label>
                    <input
                      type="text"
                      value={objectiveData.description}
                      onChange={(e) => setObjectiveData({ ...objectiveData, description: e.target.value })}
                      placeholder="Achieve quarterly revenue targets across practices"
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                    />
                  </div>
                </div>

                {/* Weight Allocation */}
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weight (%) - {objectiveData.quarter} {objectiveData.year}
                        <span className="text-xs text-gray-500 ml-1">(Default: {defaultWeightage}%)</span>
                      </label>
                      <input
                        type="range"
                        value={objectiveData.weight}
                        onChange={(e) => setObjectiveData({ ...objectiveData, weight: parseInt(e.target.value) })}
                        min="5"
                        max={Math.max(5, getRemainingWeight())}
                        disabled={getRemainingWeight() === 0 || loadingWeights}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>5%</span>
                        <span className="font-medium text-[#004E9E]">{objectiveData.weight}%</span>
                        <span>{getRemainingWeight()}% max</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {loadingWeights ? 'Checking available weight...' :
                          getRemainingWeight() === 0 ? 'No weight left for this quarter.' :
                          selectedObjective 
                            ? `You can assign up to ${getRemainingWeight()}% for ${objectiveData.quarter}. (This objective can be adjusted independently)`
                            : `You can assign up to ${getRemainingWeight()}% more for ${objectiveData.quarter}. (${Math.round(quarterlyWeights[objectiveData.quarter]?.allocated || 0)}% already assigned)`}
                      </p>
                      
                      {/* Quarterly Weight Overview */}
                      {quarterlyWeights && !loadingWeights && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <h5 className="text-xs font-medium text-gray-700 mb-2">Weight Allocation Overview - {objectiveData.year}</h5>
                          <div className="grid grid-cols-4 gap-2">
                            {Object.entries(quarterlyWeights).length > 0 ? (
                              ['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => {
                                const info = quarterlyWeights[quarter] || { allocated: 0, available: 100 };
                                return (
                                  <div key={quarter} className="text-center">
                                    <div className={`text-xs font-medium ${quarter === objectiveData.quarter ? 'text-[#004E9E]' : 'text-gray-600'}`}>
                                      {quarter}
                                    </div>
                                    <div className={`text-xs ${quarter === objectiveData.quarter ? 'text-[#004E9E]' : 'text-gray-500'}`}>
                                      {Math.round(info.allocated)}% used
                                    </div>
                                    <div className={`text-xs ${quarter === objectiveData.quarter ? 'text-[#004E9E]' : 'text-gray-400'}`}>
                                      {Math.round(info.available)}% left
                                    </div>
                                  </div>
                                );
                              })
                            ) : (
                              ['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => (
                                <div key={quarter} className="text-center">
                                  <div className={`text-xs font-medium ${quarter === objectiveData.quarter ? 'text-[#004E9E]' : 'text-gray-600'}`}>
                                    {quarter}
                                  </div>
                                  <div className={`text-xs ${quarter === objectiveData.quarter ? 'text-[#004E9E]' : 'text-gray-500'}`}>
                                    0% used
                                  </div>
                                  <div className={`text-xs ${quarter === objectiveData.quarter ? 'text-[#004E9E]' : 'text-gray-400'}`}>
                                    100% left
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Quarter</label>
                          <select
                            value={objectiveData.quarter}
                            onChange={(e) => {
                              setObjectiveData({ ...objectiveData, quarter: e.target.value });
                              if (selectedManager) {
                                loadManagerQuarterlyWeights(selectedManager, objectiveData.year);
                              }
                            }}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                          >
                            <option value="Q1">Q1 - Jan-Mar</option>
                            <option value="Q2">Q2 - Apr-Jun</option>
                            <option value="Q3">Q3 - Jul-Sep</option>
                            <option value="Q4">Q4 - Oct-Dec</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                          <select
                            value={objectiveData.year}
                            onChange={(e) => {
                              setObjectiveData({ ...objectiveData, year: Number(e.target.value) });
                              if (selectedManager) {
                                loadManagerQuarterlyWeights(selectedManager, Number(e.target.value));
                              }
                            }}
                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                          >
                            <option value={2024}>2024</option>
                            <option value={2025}>2025</option>
                            <option value={2026}>2026</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Due Date *</label>
                        <input
                          type="date"
                          value={objectiveData.dueDate}
                          onChange={(e) => setObjectiveData({ ...objectiveData, dueDate: e.target.value })}
                          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Practice Revenue Table */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Practice-Based Revenue Targets</h4>
                    <button
                      type="button"
                      onClick={() => {
                        setPracticeRevenues([...practiceRevenues, {
                          id: Date.now().toString(),
                          practiceName: '',
                          targetRevenue: '',
                          achievedRevenue: '0',
                          weight: ''
                        }]);
                      }}
                      className="px-3 py-1 bg-[#004E9E] text-white rounded-md text-sm hover:bg-[#003a73] transition-colors flex items-center gap-1"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Add Practice
                    </button>
                  </div>

                  <div className="space-y-3">
                    {practiceRevenues.map((practice, index) => (
                      <div key={practice.id} className="grid grid-cols-11 gap-3 bg-white p-4 rounded-md border border-gray-200">
                        <div className="col-span-4">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Practice Name *
                          </label>
                          <input
                            type="text"
                            value={practice.practiceName}
                            onChange={(e) => {
                              const updated = [...practiceRevenues];
                              updated[index].practiceName = e.target.value;
                              setPracticeRevenues(updated);
                            }}
                            placeholder="e.g., Cardiology, Pediatrics"
                            className="w-full text-sm border-gray-300 rounded-md focus:ring-[#004E9E] focus:border-[#004E9E]"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Weight (%) *
                          </label>
                          <input
                            type="number"
                            value={practice.weight}
                            onChange={(e) => {
                              const updated = [...practiceRevenues];
                              updated[index].weight = e.target.value;
                              setPracticeRevenues(updated);
                            }}
                            placeholder="15"
                            min="0"
                            max="100"
                            step="0.1"
                            className="w-full text-sm border-gray-300 rounded-md focus:ring-[#004E9E] focus:border-[#004E9E]"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Target Revenue ($) *
                          </label>
                          <input
                            type="number"
                            value={practice.targetRevenue}
                            onChange={(e) => {
                              const updated = [...practiceRevenues];
                              updated[index].targetRevenue = e.target.value;
                              setPracticeRevenues(updated);
                              // Update total target
                              const total = practiceRevenues.reduce((sum, p) => sum + (parseFloat(p.targetRevenue) || 0), 0);
                              setObjectiveData({ ...objectiveData, target: total.toString() });
                            }}
                            placeholder="250000"
                            min="0"
                            className="w-full text-sm border-gray-300 rounded-md focus:ring-[#004E9E] focus:border-[#004E9E]"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Achieved ($)
                          </label>
                          <input
                            type="number"
                            value={practice.achievedRevenue}
                            disabled
                            placeholder="0"
                            className="w-full text-sm border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                          />
                        </div>

                        <div className="col-span-1 flex items-end justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = practiceRevenues.filter((_, i) => i !== index);
                              setPracticeRevenues(updated);
                              // Recalculate total
                              const total = updated.reduce((sum, p) => sum + (parseFloat(p.targetRevenue) || 0), 0);
                              setObjectiveData({ ...objectiveData, target: total.toString() });
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                            title="Remove practice"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {/* Total Summary */}
                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Total Revenue Target:</span>
                          <div className="text-2xl font-bold text-gray-900">
                            ${practiceRevenues.reduce((sum, p) => sum + (parseFloat(String(p.targetRevenue)) || 0), 0).toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Total Weight Allocated:</span>
                          <div className={`text-2xl font-bold ${
                            Math.abs(practiceRevenues.reduce((sum, p) => sum + (parseFloat(String(p.weight)) || 0), 0) - parseFloat(String(objectiveData.weight || '0'))) < 0.01
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}>
                            {practiceRevenues.reduce((sum, p) => sum + (parseFloat(String(p.weight)) || 0), 0).toFixed(1)}%
                          </div>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Objective Weight:</span>
                          <div className="text-2xl font-bold text-gray-900">
                            {parseFloat(String(objectiveData.weight || '0')).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      
                      {/* Validation Message */}
                      {practiceRevenues.length > 0 && Math.abs(practiceRevenues.reduce((sum, p) => sum + (parseFloat(String(p.weight)) || 0), 0) - parseFloat(String(objectiveData.weight || '0'))) >= 0.01 && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-red-700 bg-red-50 px-3 py-2 rounded border border-red-200">
                          <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0" />
                          <span>
                            Practice weights must sum to exactly {parseFloat(String(objectiveData.weight || '0')).toFixed(1)}%. 
                            Currently: {practiceRevenues.reduce((sum, p) => sum + (parseFloat(String(p.weight)) || 0), 0).toFixed(1)}%
                          </span>
                        </div>
                      )}
                      
                      {practiceRevenues.length > 0 && Math.abs(practiceRevenues.reduce((sum, p) => sum + (parseFloat(String(p.weight)) || 0), 0) - parseFloat(String(objectiveData.weight || '0'))) < 0.01 && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded border border-green-200">
                          <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
                          <span>
                            Perfect! Practice weights sum to {parseFloat(String(objectiveData.weight || '0')).toFixed(1)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-end space-x-4 border-t pt-6">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  resetAssignmentForm();
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignObjective}
                disabled={
                  isAssigning || 
                  !selectedManager || 
                  !objectiveData.title || 
                  !objectiveData.description || 
                  !objectiveData.dueDate ||
                  (objectiveData.objectiveType === 'qualitative' && (!isWeightValid() || !objectiveData.target)) ||
                  (objectiveData.objectiveType === 'quantitative' && (practiceRevenues.length === 0 || practiceRevenues.some(p => !p.practiceName || !p.targetRevenue)))
                }
                className="px-6 py-2 bg-gradient-to-r from-[#004E9E] to-[#007BFF] text-white rounded-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center space-x-2"
              >
                {isAssigning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{selectedObjective ? 'Saving...' : 'Assigning...'}</span>
                  </>
                ) : (
                  <>
                    <span>{selectedObjective ? 'Save Changes' : 'Create & Assign Objective'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Professional Objective Details Modal */}
      {showDetailsModal && selectedObjective && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Enhanced Background overlay */}
            <div 
              className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-blue-900/20 to-gray-900/80 backdrop-blur-sm transition-opacity"
              onClick={() => setShowDetailsModal(false)}
            />

            {/* Professional Modal panel */}
            <div className="inline-block align-bottom bg-white rounded-3xl shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full overflow-hidden">
              {/* Header with CareCloud Gradient */}
              <div className="bg-gradient-to-r from-[#004E9E] via-[#0056B3] to-[#007BFF] px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30">
                        <EyeIcon className="h-7 w-7 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">Objective Review Details</h3>
                      <p className="text-blue-100 text-sm mt-1">Comprehensive objective analysis and review data</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-white/70 hover:text-white transition-colors rounded-xl p-2 hover:bg-white/10 group"
                  >
                    <XMarkIcon className="h-6 w-6 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
              </div>

              {/* Content with enhanced design */}
              <div className="px-8 py-8 space-y-8 max-h-[70vh] overflow-y-auto">
                {/* Objective Title & Description */}
                <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 border-2 border-blue-200/60 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                        <StarIcon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-2xl font-bold text-blue-900 mb-3">{selectedObjective.title}</h4>
                      <p className="text-blue-800 leading-relaxed">{selectedObjective.description}</p>
                      <div className="mt-4 flex items-center space-x-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {selectedObjective.category}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Weight: {Math.round(selectedObjective.weight)}%
                        </span>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Due: {new Date(selectedObjective.dueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Performance Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Target Card */}
                  <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-center">
                      <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center mb-4">
                        <FlagIcon className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-sm font-medium text-gray-600 mb-2">Target Value</p>
                      <p className="text-3xl font-bold text-gray-900">{selectedObjective.target}</p>
                      <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-gray-400 to-gray-500 rounded-full w-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Achieved Card */}
                  <div className="bg-white border-2 border-green-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-center">
                      <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center mb-4">
                        <CheckCircleIcon className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-sm font-medium text-green-700 mb-2">Achieved Value</p>
                      <p className="text-3xl font-bold text-green-800">{selectedObjective.current}</p>
                      <div className="mt-3 h-1 bg-green-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(100, (selectedObjective.current / selectedObjective.target) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Progress Card */}
                  <div className="bg-white border-2 border-blue-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-center">
                      <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-[#004E9E] to-[#007BFF] flex items-center justify-center mb-4">
                        <StarIcon className="h-8 w-8 text-white" />
                      </div>
                      <p className="text-sm font-medium text-blue-700 mb-2">Overall Progress</p>
                      <p className="text-3xl font-bold text-blue-800">{Math.round(selectedObjective.progress)}%</p>
                      <div className="mt-3 h-1 bg-blue-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#004E9E] to-[#007BFF] rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(100, selectedObjective.progress)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Manager Information */}
                <div className="bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center space-x-4 mb-4">
                    <UserIcon className="h-8 w-8 text-[#004E9E]" />
                    <h5 className="text-xl font-bold text-gray-900">Manager Information</h5>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Manager Name</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedObjective.managerName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Manager Title</p>
                      <p className="text-lg font-semibold text-gray-900">{selectedObjective.managerTitle}</p>
                    </div>
                  </div>
                </div>

                {/* Manager's Submission */}
                {selectedObjective.managerRemarks && (
                  <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-50 border-2 border-blue-200/60 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center space-x-3 mb-4">
                      <ChatBubbleBottomCenterTextIcon className="h-8 w-8 text-blue-600" />
                      <h5 className="text-xl font-bold text-blue-900">Manager's Submission</h5>
                    </div>
                    <div className="bg-white/70 rounded-xl p-5 border border-blue-200/50">
                      <p className="text-blue-800 leading-relaxed font-medium">{selectedObjective.managerRemarks}</p>
                      {selectedObjective.managerEvidence && (
                        <div className="mt-4 pt-4 border-t border-blue-200">
                          <div className="flex items-center space-x-2 mb-2">
                            <ClipboardDocumentListIcon className="h-5 w-5 text-blue-700" />
                            <p className="text-sm font-semibold text-blue-900">Supporting Evidence:</p>
                          </div>
                          <div className="bg-blue-100/50 rounded-lg p-3">
                            <p className="text-sm text-blue-800 font-medium">{selectedObjective.managerEvidence}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* AI Scoring Information (if available) */}
                {selectedObjective.aiScore && (
                  <div className="bg-gradient-to-br from-purple-50 via-violet-50 to-purple-50 border-2 border-purple-200/60 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center space-x-3 mb-4">
                      <CpuChipIcon className="h-8 w-8 text-purple-600" />
                      <h5 className="text-xl font-bold text-purple-900">AI Analysis</h5>
                    </div>
                    <div className="bg-white/70 rounded-xl p-5 border border-purple-200/50">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-purple-700 font-semibold">AI Generated Score:</span>
                        <span className="text-2xl font-bold text-purple-900">{selectedObjective.aiScore}/10</span>
                      </div>
                      {selectedObjective.aiComments && (
                        <p className="text-purple-800 leading-relaxed">{selectedObjective.aiComments}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Enhanced Footer */}
              <div className="bg-gradient-to-r from-gray-50 via-white to-gray-50 px-8 py-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <CalendarIcon className="h-5 w-5 text-[#004E9E]" />
                    <span>Last Updated: {selectedObjective.completedAt ? new Date(selectedObjective.completedAt).toLocaleString() : 'N/A'}</span>
                  </div>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="px-8 py-3 text-sm font-semibold text-white bg-gradient-to-r from-[#004E9E] via-[#0056B3] to-[#007BFF] rounded-xl hover:from-[#003D7C] hover:via-[#004494] hover:to-[#0056B3] transition-all duration-200 focus:ring-4 focus:ring-blue-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    Close Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HR Submission Modal */}
      {showSubmissionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Submit to HR - Digital Signature Required</h3>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Submission Summary</h4>
                  <p className="text-sm text-blue-700">
                    You are about to submit {reviewedObjectives.length} manager objective reviews to HR for final approval.
                  </p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1 max-h-32 overflow-y-auto">
                    {reviewedObjectives.map(obj => (
                      <li key={obj.id}>• {obj.managerName}: {obj.title} (Final Score: {obj.finalScore || obj.seniorManagerScore || obj.aiScore || 0}/10)</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Digital Signature * <span className="text-red-500">(Type your full name)</span>
                  </label>
                  <input
                    type="text"
                    value={seniorSignature}
                    onChange={(e) => setSeniorSignature(e.target.value)}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                    placeholder="Type your full name as digital signature"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Submission Notes (Optional)
                  </label>
                  <div className="relative">
                    <textarea
                      value={submissionNotes}
                      onChange={(e) => setSubmissionNotes(e.target.value)}
                      className="w-full pr-12 border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                      rows={3}
                      placeholder="Add any additional notes for HR review..."
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 p-2 text-gray-400 hover:text-[#004E9E] hover:bg-gray-100 rounded-md transition-colors"
                      title="Voice input (Coming soon)"
                    >
                      <MicrophoneIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className="flex space-x-2 pt-4">
                  <button
                    onClick={() => setShowSubmissionModal(false)}
                    disabled={submitting}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitToHR}
                    disabled={submitting || !seniorSignature.trim()}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <HandThumbUpIcon className="h-4 w-4" />
                        <span>Submit to HR</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Submission Modal */}
      {showIndividualSubmissionModal && selectedObjective && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-11/12 max-w-lg shadow-2xl rounded-xl bg-white">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Submit to HR</h3>
                <p className="text-sm text-gray-600 mt-1">Digital signature required for submission</p>
              </div>
              <button
                onClick={() => {
                  setShowIndividualSubmissionModal(false);
                  setIndividualSignature('');
                  setSelectedObjective(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Objective Summary */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Objective Details</h4>
                <p className="text-sm text-blue-700 font-medium">{selectedObjective.title}</p>
                <div className="text-sm text-blue-600 mt-2 space-y-1">
                  <p>Manager: {selectedObjective.managerName}</p>
                  <p>Final Score: {selectedObjective.finalScore || selectedObjective.seniorManagerScore || selectedObjective.aiScore || 0}/10</p>
                  {selectedObjective.seniorManagerScore && selectedObjective.aiScore && 
                   selectedObjective.seniorManagerScore !== selectedObjective.aiScore && (
                    <p className="text-amber-700">
                      ⚠ Override Applied: AI {selectedObjective.aiScore} → {selectedObjective.seniorManagerScore}
                    </p>
                  )}
                </div>
              </div>

              {/* Digital Signature */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Digital Signature * 
                  <span className="text-red-500 ml-1">(Type your full name)</span>
                </label>
                <input
                  type="text"
                  value={individualSignature}
                  onChange={(e) => setIndividualSignature(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-[#004E9E] focus:border-[#004E9E]"
                  placeholder="Type your full name as digital signature"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your digital signature confirms the accuracy of this review
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => {
                    setShowIndividualSubmissionModal(false);
                    setIndividualSignature('');
                    setSelectedObjective(null);
                  }}
                  disabled={individualSubmitting[selectedObjective.id]}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitIndividualObjective}
                  disabled={individualSubmitting[selectedObjective.id] || !individualSignature.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-[#004E9E] to-[#007BFF] text-white rounded-md hover:from-[#003D7C] hover:to-[#0056B3] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
                >
                  {individualSubmitting[selectedObjective.id] ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <HandThumbUpIcon className="h-4 w-4" />
                      <span>Submit to HR</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}