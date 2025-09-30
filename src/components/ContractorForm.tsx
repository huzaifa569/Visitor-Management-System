"use client";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import AppBar from './AppBar';
import { AlertCircle, ArrowUpRight, CheckCircle, FileText, ImageDownIcon, Mail, Search, User, X } from 'lucide-react';
import Link from 'next/link';
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Image from 'next/image';
import { newVisitorAPI } from "@/lib/api";
import toast from "react-hot-toast";
import { convertFileToBase64, uploadBase64File } from "../utils";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { adminAPI } from "@/lib/api";



type SystemSettingsType = {
  visitorPhotoRequired: boolean;
  trainingRequired: boolean;
}

type DocumentItem =
  { name: string; file?: File; url: string; type?: string; uploadedAt?: string };


type PPEKeys =
  | 'HARD HAT'
  | 'SAFETY SHOES'
  | 'OVERALLS'
  | 'EYE PROTECTION'
  | 'VEST VEST'
  | 'EAR PROTECTION'
  | 'RESPIRATORY EQUIP'
  | 'GLOVES'
  | 'DUST MASK'
  | 'FALL ARREST';


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



interface ContractFormProps {
  form: FormData;

  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  handleSubmit: (
    e: React.FormEvent<HTMLFormElement>, updatedForm?: FormData
  ) => void;
  setForm: React.Dispatch<React.SetStateAction<FormData>>;
  setFormType: React.Dispatch<React.SetStateAction<'visitor' | 'contractor'>>;
  error: string;
  success: string;
}

export default function ContractorForm({ form, handleChange, handleSubmit, setForm, setFormType, error, success }: ContractFormProps) {
  const hazards = useMemo(() => [
    {
      title: "Fire",
      icon: "🔥",
      controls: ["Fire Fighting equipment", "Emergency exits clear", "Fire exits identified", "Waste materials", "Hot works Permit"],
    },
    {
      title: "Slip Trip Fall",
      icon: "⚠️",
      controls: ["Clean as you go", "Report any defects", "Daily Audits", "Safe storage of", "Cordon off area", "Signage in place"],
    },
    {
      title: "Work At Heights",
      icon: "🪠",
      controls: ["Harness must be worn", "Cordon area off", "Grounds person", "Certified MEWP", "Check by Engineer", "No work over aisleways", "Signage in place"],
    },
    {
      title: "Pedestrian",
      icon: "🚶‍♂️",
      controls: ["Cordon area off", "Signage in place", "Clean as you go"],
    },
    {
      title: "Work Equipment",
      icon: "🔧",
      controls: ["Lock out Tag out", "Area isolated", "Equipment 110 volt", "Equipment certificate", "No live work", "CSCS for Forklifts", "MEWP Certificate"],
    },
    {
      title: "Electricity",
      icon: "⚡",
      controls: ["Lock out Tag out", "Area isolated", "Equipment 110 volt", "Equipment certificate", "No live work", "Trained Personnel", "RCD Testing"],
    },
    {
      title: "Noise",
      icon: "🔊",
      controls: ["Ear Protection worn", "Out of hours work", "Isolate area"],
    },
    {
      title: "Ladder",
      icon: "🪠",
      controls: ["Adequate & Tested", "Metal Ladders not in use", "Fall arrest equip in use for over 2 meters", "Correct Ladder angle 1:4", "Ladder to be footed", "Fully opened out"],
    },
    {
      title: "Manual Handling",
      icon: "💪",
      controls: ["Training Records", "Use team lifts", "Use lifting aids", "Use correct technique"],
    },
    {
      title: "House Keeping",
      icon: "🧹",
      controls: ["Clean as you go", "Signage in place", "Designated storage area", "Daily Audits", "Safe disposal of waste", "Designated Owner"],
    },
    {
      title: "Access Egress",
      icon: "🚪",
      controls: ["Warning Signs", "Designate site routes", "Pedestrian barriers", "Traffic Management"],
    },
    {
      title: "Other",
      icon: "❓",
      controls: ["Asbestos", "Dust", "Chemicals", "Confined Space", "Lone Working", "Bio Hazard"],
    },
  ], []);


  const ppeItems: PPEKeys[] = ["HARD HAT", "SAFETY SHOES", "OVERALLS", "EYE PROTECTION", "VEST VEST", "EAR PROTECTION", "RESPIRATORY EQUIP", "GLOVES", "DUST MASK", "FALL ARREST"];


  const [openHazards, setOpenHazards] = useState<Record<string, boolean>>({});
  const [selectedHazards, setSelectedHazards] = useState<Record<
    string,
    {
      title: string;
      risk: string;
      selectedControls: string[];
    }
  >>({});
  const [loading, setLoading] = useState(false);


  const [searchEmail, setSearchEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [employees, setEmployees] = useState<{ id: string; firstName: string; lastName: string; siteLocation?: string; meetingLocation?: string; }[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [settings, setSettings] = useState<SystemSettingsType>({
    visitorPhotoRequired: false,
    trainingRequired: false,
  });

  

  console.log(employees);

  useEffect(() => {
    fetchSettings();
    fetchUserDetails();
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

  const fetchUserDetails = async () => {

    try {
      const users = await adminAPI.getUsers();

      // Filter out admins and map to only firstname + lastname
      const nonAdminEmployees = users
        .filter((u) => u.role !== 'admin')
        .map((u) => ({
          id: u._id,
          firstName: u.firstName,
          lastName: u.lastName,
          siteLocation: u.siteLocation,
          meetingLocation: u.meetingLocation

        }));

      setEmployees(nonAdminEmployees);
      console.log(nonAdminEmployees);



    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch employees');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchEmail(e.target.value);
  };

  const searchVisitor = async (e?: React.KeyboardEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!searchEmail) return;

    try {
      setIsSearching(true);
      const data = await newVisitorAPI.searchByEmail(searchEmail.trim().toLowerCase());

      if (!data) {
        toast.error("No visitor found with that email.");
        return;
      }

      // ✅ Set the returned data into your form
      setForm((prevForm) => ({
        ...prevForm,
        ...data,
      }));

      toast.success("Visitor data loaded.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch visitor info.");
    } finally {
      setIsSearching(false);
    }
  };

  const toggleControl = (title: string, control: string) => {
    setSelectedHazards((prev) => {
      const prevControls = prev[title]?.selectedControls || [];
      const isSelected = prevControls.includes(control);
      const updatedControls = isSelected
        ? prevControls.filter((c) => c !== control)
        : [...prevControls, control];

      return {
        ...prev,
        [title]: {
          ...prev[title],
          selectedControls: updatedControls,
        },
      };
    });
  };

  const setRisk = (title: string, risk: string) => {
    setSelectedHazards((prev) => ({
      ...prev,
      [title]: {
        ...prev[title],
        risk,
      },
    }));
  };

  console.log(selectedHazards);



  const setPPE = useCallback((item: string, opt: string) => {
    console.log("setPPE called for:");
    setForm((prevForm) => ({
      ...prevForm,
      ppe: {
        ...prevForm.ppe,
        [item]: opt,
      },
    }));
  }, [setForm]);




  const toggleHazardBox = useCallback((hazard: string) => {
    setOpenHazards((prev) => ({
      ...prev,
      [hazard]: !prev[hazard],
    }));
  }, [])



  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updatedHazards = Object.values(selectedHazards).map((hazard) => ({
        title: hazard.title,
        risk: hazard.risk,
        selectedControls: hazard.selectedControls,
      }));

      console.log(updatedHazards);


      const updatedForm = {
        ...form,
        hazards: updatedHazards,
      };

      // ✅ Don't rely on setForm here — just pass updatedForm directly
      handleSubmit(e, updatedForm);
      setLoading(false);
     


    } catch (err) {
      console.error("Submission error:", err);

    } finally {
      setLoading(false);
    }
  };



  const MAX_FILE_SIZE_MB = 5;

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const uploadedDocs: DocumentItem[] = [];

    for (const file of Array.from(files)) {
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > MAX_FILE_SIZE_MB) {
        alert(`File "${file.name}" exceeds 5MB limit and will be skipped.`);
        continue;
      }

      try {
        const base64 = await convertFileToBase64(file);
        const fullBase64 = `data:${file.type};base64,${base64}`;
        const url = await uploadBase64File(fullBase64, "raw"); // Call your Cloudinary upload function

        if (url) {
          uploadedDocs.push({
            name: file.name,
            url,
            type: file.type,
            file: undefined,
          });
        }
      } catch (error) {
        console.error(`Document upload failed for "${file.name}":`, error);
      }
    }

    // Update form state
    setForm((prev) => ({
      ...prev,
      documents: [...(prev.documents || []), ...uploadedDocs],
    }));
  };



  type UploadEvent =
    | React.ChangeEvent<HTMLInputElement>
    | React.DragEvent<HTMLDivElement>;


  const handleFileUpload = async (e: UploadEvent) => {
    e.preventDefault();
    const field = "profile pics";
    let file: File | null = null;

    if ("dataTransfer" in e) {
      // Handle drag-and-drop
      file = e.dataTransfer.files?.[0] || null;
    } else {
      // Handle traditional input upload
      file = e.target.files?.[0] || null;
    }

    if (file) {
      // ✅ Replace slashes in file name to avoid Cloudinary error
      const sanitizedFile = new File([file], file.name.replace(/\//g, '-'), {
        type: file.type,
      });

      const fileSizeInMB = sanitizedFile.size / (1024 * 1024);

      try {
        // ✅ Convert to base64
        const base64 = await convertFileToBase64(sanitizedFile);

        if (fileSizeInMB > MAX_FILE_SIZE_MB) {
          alert("File size exceeds 5MB limit. Please upload a smaller image.");
          return;
        }

        if (base64) {
          setUploadLoading(true);

          // ✅ Upload to Cloudinary
          const url = await uploadBase64File(base64, "image", setUploadLoading);
          setUploadLoading(false);

          if (url) {
            setForm((prev) => ({
              ...prev,
              pics: url,
            }));
            console.log("Upload successful:", field);
          } else {
            console.warn("Upload failed: No URL returned");
          }
        }
      } catch (error) {
        console.error("Upload failed:", error);
        setUploadLoading(false);
      }
    } else {
      console.warn("No file selected");
    }
  };





  return (
    <main className="min-h-screen bg-gradient-to-br from-white via-indigo-100 to-purple-100 pb-4 sm:pb-8 lg:pb-10">
      <AppBar />
      <div className='bg-white rounded-xl sm:rounded-3xl shadow-lg sm:p-6 md:p-8 w-full max-w-8xl sm:mx-4 md:mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-4 sm:mt-6  pb-4 sm:pb-20'>

        <div className="p-4 w-full mx-auto space-y-6 bg-white rounded-xl shadow-md mt-2 sm:mt-6 lg:mt-8 xl:mt-10">
          <h1 className="text-2xl font-bold mb-4">New Contractor
          </h1>
          <div className="flex items-center mb-2">
            <div className="bg-blue-100 p-1.5 sm:p-2 rounded-full mr-2 sm:mr-3 flex-shrink-0">
              <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-700" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 leading-tight">Visitor Registration</h1>
          </div>
          <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-4">Please fill in your details to register for a contract. Fields marked with * are required.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 sm:p-6 rounded-lg mb-4 sm:mb-6 flex items-start">
              <div className="bg-red-100 p-1.5 sm:p-2 rounded-full mr-3 sm:mr-4 flex-shrink-0">
                <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-base sm:text-lg mb-1 sm:mb-2">Registration Error</p>
                <p className="text-red-700 text-sm sm:text-base">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 p-4 sm:p-6 rounded-lg mb-4 sm:mb-6 flex items-start">
              <div className="bg-green-100 p-1.5 sm:p-2 rounded-full mr-3 sm:mr-4 flex-shrink-0">
                <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-base sm:text-lg mb-1 sm:mb-2">Registration Successful!</p>
                <p className="text-green-700 text-sm sm:text-base">{success}</p>
                <div className="mt-3 sm:mt-4 flex flex-wrap gap-2 sm:gap-3">
                  <Link href="/" className="bg-white border border-green-300 text-green-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-green-50 transition-colors">
                    Return to Home
                  </Link>

                  <button
                    type="button"
                    onClick={() => setForm({
                      firstName: '',
                      lastName: '',
                      phone: '',
                      email: '',
                      hostEmployee: '',
                      siteLocation: '',
                      purpose: '',
                      department: '',
                      meetingLocation: '',
                      visitStartDate: new Date().toISOString().slice(0, 16),
                      visitEndDate: new Date().toISOString().slice(0, 16),
                      visitorCategory: 'visitor',
                      agreed: "",
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
                    })}
                    className="bg-green-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    Register Another Visit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Return Visitor Search */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl mb-6 sm:mb-8 shadow-sm border border-blue-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
              <div className="flex items-center">
                <div className="bg-blue-100 p-1.5 sm:p-2.5 rounded-full mr-2 sm:mr-3 flex-shrink-0">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-blue-900">Been Here Before?</h3>
              </div>
              <Link
                href="/been-here-before"
                className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md transition-colors flex items-center self-start sm:self-auto"
              >
                Use dedicated page <ArrowUpRight className="ml-1 h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </Link>
            </div>
            <div className="flex items-start mb-4 sm:mb-5">
              <div className="bg-blue-100 p-1 sm:p-1.5 rounded-full mr-2 sm:mr-3 mt-0.5 flex-shrink-0">
                <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
              </div>
              <p className="text-sm sm:text-base text-gray-700">
                If you&apos;ve visited us before, enter your email to quickly fill in your information and save time.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="flex-grow relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full pl-9 sm:pl-10 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/80"
                  value={searchEmail}
                  onChange={handleSearchChange}
                  onKeyDown={(e) => e.key === 'Enter' && searchVisitor(e)}
                />
              </div>
              <button
                type="button"
                onClick={searchVisitor}
                disabled={isSearching || !searchEmail}
                className="bg-blue-700 hover:bg-blue-800 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg disabled:bg-blue-300 transition-colors flex items-center justify-center whitespace-nowrap shadow-sm text-sm"
              >
                {isSearching ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    Find My Information
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Personal Information */}
          <div className="p-2 mx-auto space-y-6 bg-white rounded-xl mt-2 md:mt-4">
            <form onSubmit={onSubmit} className="space-y-6">
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <h2 className="text-xl font-semibold">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
                    <Input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
                    <Input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} required />
                    <Input name="email" placeholder="Email Address" value={form.email} onChange={handleChange} />
                    <Select required value={form.visitorCategory} onValueChange={(value) => setFormType(value as 'visitor' | 'contractor')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Visitor Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contractor">Contractor</SelectItem>
                        <SelectItem value="visitor">Visitor</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Updated Site Location to use a dropdown */}
                    <Select value={form.siteLocation} onValueChange={(value) => setForm({ ...form, siteLocation: value })} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Site Location" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem
                            key={employee.id}
                            value={`${employee.siteLocation?.toLowerCase()}`}
                          >
                            {employee.siteLocation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Contractor Photo */}
                  {settings.visitorPhotoRequired && (
                    <div>
                      <h2 className="text-sm md:text-base text-gray-700 font-semibold">Upload Profile Picture</h2>
                      <div className={`w-[80%] md:w-2/3 lg:w-2/4 h-fit  border-2 border-gray-300 p-2 bg-white rounded-3xl my-4 mx-auto ${form.pics ? "p-1" : "p-10"} `} onDrop={(e) => handleFileUpload(e)}
                        onDragOver={(e) => e.preventDefault()}>
                        <label htmlFor="pics">
                          {form.pics ? (
                            <Image
                              src={form.pics}
                              alt="pics img"
                              width={100}
                              height={100}
                              className="w-full h-[200px] object-cover object-center rounded-3xl"
                            />
                          ) : (
                            <>
                              {uploadLoading ? (
                                <div className="flex justify-center items-center h-full w-full">
                                  <AiOutlineLoading3Quarters className="animate-spin text-primary text-5xl" />
                                </div>
                              ) : (
                                <div className=" flex items-center justify center gap-2 md:gap-4">
                                  <ImageDownIcon color="gray" /> <p className="text-[12px] md:text-sm text-gray-600">Click to upload image</p>
                                </div>
                              )}
                            </>
                          )}
                          <input
                            id="pics"
                            type="file"
                            name="pics"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e)}
                          />
                        </label>
                      </div>
                    </div>
                  )}

                </CardContent>
              </Card>

              {/* Visit Information */}
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <h2 className="text-xl font-semibold">Visit Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select value={form.department} onValueChange={(value) => setForm({ ...form, department: value })} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hr">HR</SelectItem>
                        <SelectItem value="engineering">Engineering</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={form.hostEmployee} onValueChange={(value) => setForm({ ...form, hostEmployee: value })} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Host Employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem
                            key={employee.id}
                            value={`${employee.firstName?.toLowerCase()}-${employee.lastName?.toLowerCase()}`}
                          >
                            {employee.firstName} {employee.lastName}
                          </SelectItem>
                        ))}

                      </SelectContent>
                    </Select>
                    <Select value={form.meetingLocation} onValueChange={(value) => setForm({ ...form, meetingLocation: value })} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Meeting Location" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees.map((employee) => (
                          <SelectItem
                            key={employee.id}
                            value={`${employee.meetingLocation?.toLowerCase()}`}
                          >
                            {employee.meetingLocation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="visit-start">Visit Start Date & Time:</Label>
                      <Input id="visit-start" type="datetime-local" name="visitStartDate" value={form.visitStartDate} onChange={handleChange} />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor="visit-end">Visit End Date & Time:</Label>
                      <Input id="visit-end" type="datetime-local" name="visitEndDate" value={form.visitEndDate} onChange={handleChange} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hazards Section */}
              <Card>
                <CardContent>
                  <h1 className="text-lg sm:text-xl md:text-2xl xl:text-3xl font-bold text-center mb-6 border-b pb-2">HAZARD ASSESSMENT AND CONTROLS</h1>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {hazards.map((hazard, index) => (
                      <div
                        key={index}
                        className={`border p-4 rounded-xl shadow-md bg-white cursor-pointer relative ${openHazards[hazard.title] ? "border-blue-500 ring-2 ring-blue-300" : "border-gray-300"
                          }`}
                      >
                        {openHazards[hazard.title] && (
                          <div className="w-full flex items-center justify-end">
                            <X className="mr-1 md:mr-2" onClick={(e) => {
                              e.stopPropagation();
                              toggleHazardBox(hazard.title)
                              setSelectedHazards((prev) => {
                                const newState = { ...prev };
                                delete newState[hazard.title];
                                return newState;
                              });
                            }} />
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-2" onClick={(e) => {
                          e.stopPropagation();
                          toggleHazardBox(hazard.title)
                          setSelectedHazards((prev) => {
                            // Select
                            return {
                              ...prev,
                              [hazard.title]: {
                                title: hazard.title,
                                risk: "",
                                selectedControls: [],
                              },
                            };
                          })
                        }}>
                          <span className="text-xl font-semibold">{hazard.title}</span>
                          <span className="text-2xl">{hazard.icon}</span>
                        </div>
                        {openHazards[hazard.title] && (
                          <>
                            <div className="mb-2">
                              <span className="font-medium">Mark Risk:</span>
                              <div className="flex gap-3 mt-1">
                                {["H", "M", "L"].map((r) => (
                                  <label key={r} className="flex items-center gap-1">
                                    <input
                                      type="radio"
                                      name={`risk-${index}`}
                                      value={r}
                                      checked={selectedHazards[hazard.title]?.risk === r}
                                      required
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        setRisk(hazard.title, r);
                                      }}
                                    />
                                    {r}
                                  </label>
                                ))}
                              </div>
                            </div>
                            <div>
                              <span className="font-medium">Controls:</span>
                              <div className="mt-1 space-y-1">
                                {hazard.controls.map((ctrl, i) => (
                                  <label key={i} className="flex items-center gap-2 cursor-pointer" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="checkbox"
                                      className="accent-blue-500"
                                      checked={selectedHazards[hazard.title]?.selectedControls.includes(ctrl) || false}
                                      onChange={() => toggleControl(hazard.title, ctrl)}
                                    />
                                    <span>{ctrl}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* PPE Section */}
              <Card>
                <CardContent>
                  <h2 className="text-2xl font-bold mb-4">Personnel Protective Equipment</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {ppeItems.map((item, idx) => (
                      <div key={idx} className="border p-2 rounded-xl shadow-sm">
                        <div className="font-semibold mb-2 text-sm text-center">{item}</div>
                        <div className="flex justify-center gap-4">
                          {["Y", "N"].map((opt) => (
                            <label key={opt} className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="radio"
                                name={`ppe-${item}`}
                                value={opt}
                                checked={form.ppe[item] === opt}
                                onChange={() => setPPE(item, opt)}
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>


                </CardContent>
              </Card>

              {/* Comments & Submit */}
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <h2 className="text-xl font-semibold">Comments</h2>
                  <Textarea placeholder="Comments" className="min-h-[100px]" name="purpose" value={form.purpose}
                    onChange={handleChange} required />

                  {/* Document Upload */}
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Attach Documents</h2>
                    <p className="text-sm text-gray-500">Accepted file types: PDF, DOC, DOCX</p>
                    <input
                      placeholder="enter document"
                      type="file"
                      name="documents"
                      accept=".pdf,.doc,.docx"
                      multiple
                      onChange={handleDocumentUpload}
                      className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    />

                    {/* Optional Preview / List of Selected Files */}
                    {form.documents?.length > 0 && (
                      <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1 mt-2">
                        {form.documents.map((doc, idx) => (
                          <li key={idx}>{doc.name}</li>
                        ))}
                      </ul>
                    )}
                  </div>


                  {/* Terms and condition */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 mb-4 sm:mb-6 shadow-sm mt-4 sm:mt-6">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mr-1.5 sm:mr-2 flex-shrink-0" />
                      Terms and Conditions
                    </h3>

                    <div className="bg-gray-50 p-3 sm:p-4 rounded-lg border border-gray-200 mb-3 sm:mb-4 text-xs sm:text-sm text-gray-700">
                      <p className="mb-1.5 sm:mb-2">By checking the box below, you agree to:</p>
                      <ul className="list-disc pl-4 sm:pl-5 space-y-0.5 sm:space-y-1">
                        <li>Follow all safety and security protocols during your visit</li>
                        <li>Wear your visitor badge visibly at all times</li>
                        <li>Be escorted by your host in restricted areas</li>
                        <li>Provide accurate information for security purposes</li>
                        <li>Allow your information to be stored in our visitor management system</li>
                      </ul>
                    </div>

                    <div className="flex items-start gap-2 sm:gap-3">
                      <div className="mt-0.5">
                        <input
                          type="checkbox"
                          name="agreed"
                          id="agreed"
                          required
                          // checked={()=> form.agreed}
                          onChange={handleChange}
                          className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <label htmlFor="agreed" className="text-xs sm:text-sm text-gray-700">
                        I agree to the <a href="#" className="text-blue-600 hover:underline font-medium">Terms and Conditions</a> and acknowledge that my personal information will be processed in accordance with the <a href="#" className="text-blue-600 hover:underline font-medium">Privacy Policy</a>.*
                      </label>
                    </div>
                  </div>


                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4 justify-between">
                    <Link
                      href="/"
                      className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-2 sm:px-4 py-1 sm:py-2 rounded-lg w-full sm:w-auto text-center transition-colors flex items-center justify-center text-sm sm:text-base"
                    >
                      <ArrowUpRight className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5 rotate-180" />
                      Return to Home
                    </Link>
                    {settings.trainingRequired ? (
                      <Button type='submit' className="mt-4 w-full sm:w-auto" disabled={loading}>
                        {loading ? 'Loading...' : 'Next'}
                      </Button>
                    ) : (
                      <Button type='submit' className="mt-4 w-full sm:w-auto" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit'}
                      </Button>
                    )}

                  </div>
                </CardContent>
              </Card>

            </form>
          </div>
        </div>

        {/* IMAGE SECTION */}
        <div className="flex flex-col gap-3 sm:gap-4 items-center justify-center w-full">
          <div className="relative w-full h-40 sm:h-48 md:h-60 lg:h-96">
            <Image
              src="/building.jpeg"
              alt="Building"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
              className="rounded-lg sm:rounded-xl"
              priority
            />
          </div>
          <div className="relative w-full h-40 sm:h-48 md:h-60 lg:h-96">
            <Image
              src="/reception.jpeg"
              alt="Reception"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 100vw, 50vw"
              style={{ objectFit: 'cover' }}
              className="rounded-lg sm:rounded-xl"
              priority
            />
          </div>
        </div>
      </div>
    </main>
  );
}
