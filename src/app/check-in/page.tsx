"use client";
import React, { useEffect, useState } from 'react';
import ContractorForm from '@/components/ContractorForm';
import VisitorForm from '@/components/VisitorForm';
import { useRouter } from "next/navigation";
import { adminAPI } from '@/lib/api';
import toast from "react-hot-toast";


type SystemSettingsType = {
  visitorPhotoRequired: boolean;
  trainingRequired: boolean;
}


type DocumentItem =
  { name: string; file?: File; url: string; type?: string; uploadedAt?: string };


type FormData = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  visitorCategory: string;
  siteLocation: string;
  department: string;
  hostEmployee: string;
  meetingLocation: string;
  visitStartDate: string;
  visitEndDate: string;
  purpose: string;
  agreed: string;
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
  pics?: string;
};

type VisitorFormData = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  visitorCategory: string;
  siteLocation: string;
  department: string;
  hostEmployee: string;
  meetingLocation: string;
  visitStartDate: string;
  visitEndDate: string;
  purpose: string;
  agreed: string;
  pics?: string; // ✅ optional here
};


const defaultVisitorForm = (formType: string): VisitorFormData => ({
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  visitorCategory: formType,
  siteLocation: '',
  department: '',
  hostEmployee: '',
  meetingLocation: '',
  visitStartDate: new Date().toISOString().slice(0, 16),
  visitEndDate: new Date().toISOString().slice(0, 16),
  purpose: '',
  agreed: 'off',
  pics: '',
});

const defaultContractorForm = (formType: string): FormData => ({
  ...defaultVisitorForm(formType),
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
  const [formType, setFormType] = useState<'visitor' | 'contractor'>('visitor');
  const [visitorForm, setVisitorForm] = useState(defaultVisitorForm('visitor'));
  const [contractorForm, setContractorForm] = useState(defaultContractorForm('contractor'));
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [settings, setSettings] = useState<SystemSettingsType>({
    visitorPhotoRequired: false,
    trainingRequired: false,
  });
  const router = useRouter();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {

    try {
      const systemSettings = await adminAPI.getSystemSettings();

      // Ensure all properties are present using fallback/default values
      setSettings({
        visitorPhotoRequired: systemSettings?.visitorPhotoRequired ?? false,
        trainingRequired: systemSettings?.trainingRequired ?? false,
      });
    } catch (err) {
      console.error('Error fetching system settings:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to load system settings');
    }
  };


  useEffect(() => {
    if (formType === 'visitor') {
      setVisitorForm((prev) => ({ ...prev, visitorCategory: formType }));
    } else {
      setContractorForm((prev) => ({ ...prev, visitorCategory: formType }));
    }
  }, [formType]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (formType === 'visitor') {
      setVisitorForm((prev) => ({ ...prev, [name]: value }))
    } else {
      setContractorForm((prev) => ({ ...prev, [name]: value }));
    }

  };

  console.log(contractorForm);



  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, updatedFormOverride?: FormData) => {
    e.preventDefault();



    try {
      const isVisitor = formType === 'visitor';
      const formData = isVisitor ? visitorForm : contractorForm;
      const endpoint = isVisitor ? 'visitor' : 'contractor';
      const dataToSubmit = updatedFormOverride || formData;

      const response = await fetch(`https://backend-vms-1.onrender.com/api/forms/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Submission failed');
      }

      const data = await response.json();
      console.log(`${formType} form submitted:`, data);

      if (!isVisitor) {
        localStorage.setItem('contractorId', data.contractor._id);
      }

      if (isVisitor) {
        setVisitorForm(defaultVisitorForm(formType));
      } else {
        setContractorForm(defaultContractorForm(formType));
      }

      setSuccess(`Your visit has been scheduled successfully! Please check in at the reception desk when you arrive. ${formType === "visitor" ? visitorForm.hostEmployee : contractorForm.hostEmployee} has been notified of your upcoming visit on ${new Date(formType === "contractor" ? visitorForm.visitStartDate : contractorForm.visitStartDate).toLocaleDateString()}.`);
      setTimeout(() => { setError("") }, 3000)

      if (formType === "visitor") {
        alert("Visitor Form submitted Successfully!");
      } else {
        alert("Redirecting You to Training Page!");
        setTimeout(() => {
          if (settings.trainingRequired) {
            router.push("/training-doc");
          } else {
            alert("Contractor Form Submitted");
            router.push('/');
          }
        }, 2000);

      }


    } catch (error) {
      console.error('Submission failed:', error);
      setError('Your form was not submitted. Please try again.');
      setTimeout(() => { setError("") }, 3000)
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <>
      {formType === 'visitor' ? (
        <VisitorForm
          setForm={setVisitorForm}
          form={visitorForm}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          setFormType={setFormType}
          error={error}
          success={success}
        />
      ) : (
        <ContractorForm
          setForm={setContractorForm}
          form={contractorForm}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          setFormType={setFormType}
          error={error}
          success={success}
        />
      )}
    </>
  );
}
