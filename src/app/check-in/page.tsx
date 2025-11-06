// "use client";
// import React, { useEffect, useState } from 'react';
// import ContractorForm from '@/components/ContractorForm';
// import VisitorForm from '@/components/VisitorForm';
// import { useRouter } from "next/navigation";
// import { adminAPI } from '@/lib/api';
// import toast from "react-hot-toast";

// type SystemSettingsType = {
//   visitorPhotoRequired: boolean;
//   trainingRequired: boolean;
// }

// type DocumentItem = {
//   name: string;
//   file?: File;
//   url: string;
//   type?: string;
//   uploadedAt?: string;
// };

// // Base form data that both types share
// type BaseFormData = {
//   firstName: string;
//   lastName: string;
//   phone: string;
//   email: string;
//   visitorCategory: string;
//   siteLocation: string;
//   company:string,
//   comments:string,
//   department: string;
//   hostEmployee: string;
//   meetingLocation: string;
//   visitStartDate: string;
//   visitEndDate: string;
//   purpose: string;
//   agreed: string;
//   pics?: string;
// };

// // Contractor specific form data
// type ContractorFormData = BaseFormData & {
//   hazards: {
//     title: string;
//     risk: string | number;
//     selectedControls: string[];
//   }[];
//   ppe: {
//     "HARD HAT": 'N' | 'Y';
//     "SAFETY SHOES": 'N' | 'Y';
//     "OVERALLS": 'N' | 'Y';
//     "EYE PROTECTION": 'N' | 'Y';
//     "VEST VEST": 'N' | 'Y';
//     "EAR PROTECTION": 'N' | 'Y';
//     "RESPIRATORY EQUIP": 'N' | 'Y';
//     "GLOVES": 'N' | 'Y';
//     "DUST MASK": 'N' | 'Y';
//     "FALL ARREST": 'N' | 'Y';
//   };
//   documents: DocumentItem[];
// };

// // Visitor form data
// type VisitorFormData = BaseFormData;

// const defaultVisitorForm = (formType: string): VisitorFormData => ({
//   firstName: '',
//   lastName: '',
//   phone: '',
//   email: '',
//   visitorCategory: formType,
//   siteLocation: '',
//   company: '',          
//   comments: '',          
//   department: '',
//   hostEmployee: '',
//   meetingLocation: '',
//   visitStartDate: new Date().toISOString().slice(0, 16),
//   visitEndDate: new Date().toISOString().slice(0, 16),
//   purpose: '',
//   agreed: 'off',
//   pics: '',
// });

// const defaultContractorForm = (formType: string): ContractorFormData => ({
//   ...defaultVisitorForm(formType),
//   hazards: [],
//   ppe: {
//     "HARD HAT": 'N',
//     "SAFETY SHOES": 'N',
//     "OVERALLS": 'N',
//     "EYE PROTECTION": 'N',
//     "VEST VEST": 'N',
//     "EAR PROTECTION": 'N',
//     "RESPIRATORY EQUIP": 'N',
//     "GLOVES": 'N',
//     "DUST MASK": 'N',
//     "FALL ARREST": 'N',
//   },
//   documents: [],
// });

// export default function FormPage() {
//   const [formType, setFormType] = useState<'visitor' | 'contractor'>('visitor');
//   const [visitorForm, setVisitorForm] = useState<VisitorFormData>(defaultVisitorForm('visitor'));
//   const [contractorForm, setContractorForm] = useState<ContractorFormData>(defaultContractorForm('contractor'));
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [settings, setSettings] = useState<SystemSettingsType>({
//     visitorPhotoRequired: false,
//     trainingRequired: false,
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const router = useRouter();

//   useEffect(() => {
//     fetchSettings();
//   }, []);

//   const fetchSettings = async () => {
//     try {
//       const systemSettings = await adminAPI.getSystemSettings();
//       setSettings({
//         visitorPhotoRequired: systemSettings?.visitorPhotoRequired ?? false,
//         trainingRequired: systemSettings?.trainingRequired ?? false,
//       });
//     } catch (err) {
//       console.error('Error fetching system settings:', err);
//       toast.error(err instanceof Error ? err.message : 'Failed to load system settings');
//     }
//   };

//   useEffect(() => {
//     if (formType === 'visitor') {
//       setVisitorForm((prev) => ({ ...prev, visitorCategory: formType }));
//     } else {
//       setContractorForm((prev) => ({ ...prev, visitorCategory: formType }));
//     }
//   }, [formType]);

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
//   ) => {
//     const { name, value } = e.target;
//     if (formType === 'visitor') {
//       setVisitorForm((prev) => ({ ...prev, [name]: value }));
//     } else {
//       setContractorForm((prev) => ({ ...prev, [name]: value }));
//     }
//   };

// const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, updatedFormOverride?: ContractorFormData | VisitorFormData) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setError('');
//     setSuccess('');

//     try {
//       const isVisitor = formType === 'visitor';
//       const formData = isVisitor ? visitorForm : contractorForm;
//       let dataToSubmit = updatedFormOverride || formData;

//       // For contractor forms, remove file objects from documents before submitting
//       if (!isVisitor && 'documents' in dataToSubmit) {
//         const contractorData = dataToSubmit as ContractorFormData;
//         dataToSubmit = {
//           ...contractorData,
//           documents: contractorData.documents.map(doc => ({
//             name: doc.name,
//             url: doc.url,
//             type: doc.type,
//             uploadedAt: doc.uploadedAt
//           }))
//         } as ContractorFormData;
//       }

//       const response = await fetch(`https://vistor-mangement-system-backend.vercel.app/api/forms/contractor`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(dataToSubmit),
//       });
//       if (response.status === 201) {
//         setTimeout(() => {
//           router.push('/admin/training');
//         }, 1000);
//       }
//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.error || 'Submission failed');
//       }

//       const data = await response.json();
//       console.log(`${formType} form submitted:`, data);

//       if (!isVisitor) {
//         localStorage.setItem('contractorId', data.contractor._id);
//       }

//       // Reset forms
//       if (isVisitor) {
//         setVisitorForm(defaultVisitorForm(formType));
//       } else {
//         setContractorForm(defaultContractorForm(formType));
//       }

//       // setSuccess(`Your visit has been scheduled successfully! Please check in at the reception desk when you arrive. ${formType === "visitor" ? visitorForm.hostEmployee : contractorForm.hostEmployee} has been notified of your upcoming visit on ${new Date(formType === "visitor" ? visitorForm.visitStartDate : contractorForm.visitStartDate).toLocaleDateString()}.`);
//     } catch (error) {
//       console.error('Submission failed:', error);
//       const errorMessage = error instanceof Error ? error.message : 'Your form was not submitted. Please try again.';
//       setError(errorMessage);
//       toast.error(errorMessage);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };


//   return (
//     <>
//       {formType === 'contractor' ? (
//         <VisitorForm
//           setForm={setVisitorForm}
//           form={visitorForm}
//           handleChange={handleChange}
//           handleSubmit={handleSubmit}
//           setFormType={setFormType}
//           error={error}
//           success={success}
//           isSubmitting={isSubmitting}
//         />
//       ) : (
//         <ContractorForm
//           setForm={setContractorForm}
//           form={contractorForm}
//           handleChange={handleChange}
//           handleSubmit={handleSubmit}
//           setFormType={setFormType}
//           error={error}
//           success={success}
//           isSubmitting={isSubmitting}
//         />
//       )}
//     </>
//   );
// }


'use client';

import React, { useEffect, useState } from 'react';
import ContractorForm from '@/components/ContractorForm';
import { useRouter } from "next/navigation";
import { adminAPI } from '@/lib/api';
import toast from "react-hot-toast";

type SystemSettingsType = {
  visitorPhotoRequired: boolean;
  trainingRequired: boolean;
}

type DocumentItem = {
  name: string;
  file?: File;
  url: string;
  type?: string;
  uploadedAt?: string;
};

type BaseFormData = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  visitorCategory: string;
  siteLocation: string;
  company: string;
  comments: string;
  department: string;
  hostEmployee: string;
  meetingLocation: string;
  visitStartDate: string;
  visitEndDate: string;
  purpose: string;
  agreed: string;
  pics?: string;
};

type ContractorFormData = BaseFormData & {
  hazards: {
    title: string;
    risk: string | number;
    selectedControls: string[];
  }[];
  ppe: {
    "HARD HAT": 'N' | 'Y';
    "SAFETY SHOES": 'N' | 'Y';
    "OVERALLS": 'N' | 'Y';
    "EYE PROTECTION": 'N' | 'Y';
    "VEST VEST": 'N' | 'Y';
    "EAR PROTECTION": 'N' | 'Y';
    "RESPIRATORY EQUIP": 'N' | 'Y';
    "GLOVES": 'N' | 'Y';
    "DUST MASK": 'N' | 'Y';
    "FALL ARREST": 'N' | 'Y';
  };
  documents: DocumentItem[];
};

const defaultContractorForm = (): ContractorFormData => ({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  visitorCategory: 'contractor',
  siteLocation: '',
  company: '',          
  comments: '',          
  department: '',
  hostEmployee: '',
  meetingLocation: '',
  visitStartDate: new Date().toISOString().slice(0, 16),
  visitEndDate: new Date().toISOString().slice(0, 16),
  purpose: '',
  agreed: 'off',
  pics: '',
  hazards: [],
  ppe: {
    "HARD HAT": 'N',
    "SAFETY SHOES": 'N',
    "OVERALLS": 'N',
    "EYE PROTECTION": 'N',
    "VEST VEST": 'N',
    "EAR PROTECTION": 'N',
    "RESPIRATORY EQUIP": 'N',
    "GLOVES": 'N',
    "DUST MASK": 'N',
    "FALL ARREST": 'N',
  },
  documents: [],
});

export default function FormPage() {
  const [contractorForm, setContractorForm] = useState<ContractorFormData>(defaultContractorForm());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [settings, setSettings] = useState<SystemSettingsType>({
    visitorPhotoRequired: false,
    trainingRequired: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const systemSettings = await adminAPI.getSystemSettings();
      setSettings({
        visitorPhotoRequired: systemSettings?.visitorPhotoRequired ?? false,
        trainingRequired: systemSettings?.trainingRequired ?? false,
      });
    } catch (err) {
      console.error('Error fetching system settings:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to load system settings');
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setContractorForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, updatedFormOverride?: ContractorFormData) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const dataToSubmit = updatedFormOverride || contractorForm;

      // Remove file objects from documents before submitting
      const submitData = {
        ...dataToSubmit,
        documents: dataToSubmit.documents.map(doc => ({
          name: doc.name,
          url: doc.url,
          type: doc.type,
          uploadedAt: doc.uploadedAt
        }))
      };

      console.log('🔵 Submitting contractor form...', submitData);

      const response = await fetch(`https://vistor-mangement-system-backend.vercel.app/api/forms/contractor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
      });

      console.log('🔵 Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
        throw new Error(errorData.error || 'Submission failed');
      }

      const data = await response.json();
      console.log('✅ Contractor form submitted successfully:', data);

      // Save contractor ID and redirect
      if (data.contractor && data.contractor._id) {
        const contractorId = data.contractor._id;
        
        localStorage.setItem('contractorId', contractorId);
        console.log('✅ Contractor ID saved to localStorage:', contractorId);

        // Reset form
        setContractorForm(defaultContractorForm());

        setSuccess('Form submitted successfully! Redirecting...');
        toast.success('Form submitted successfully!');

        // Redirect with contractorId
        setTimeout(() => {
          router.push(`/training-doc?contractorId=${contractorId}`);
        }, 1000);
      } else {
        throw new Error('No contractor data received from server');
      }

    } catch (error) {
      console.error('❌ Submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Your form was not submitted. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ContractorForm
      setForm={setContractorForm}
      form={contractorForm}
      handleChange={handleChange}
      handleSubmit={handleSubmit}
      setFormType={() => {}} // Remove form type switching
      error={error}
      success={success}
      isSubmitting={isSubmitting}
    />
  );
}