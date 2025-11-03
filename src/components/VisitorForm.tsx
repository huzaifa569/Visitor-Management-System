"use client";
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import AppBar from './AppBar';
import { AlertCircle, ArrowUpRight, CheckCircle, FileText, ImageDownIcon, Mail, Search, User } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { newVisitorAPI, adminAPI } from '@/lib/api';
import toast from "react-hot-toast";
import { convertFileToBase64, uploadBase64File } from "../utils";
import { AiOutlineLoading3Quarters } from "react-icons/ai";


type SystemSettingsType = {
    visitorPhotoRequired: boolean;
}

type FormData = {
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

interface VisitorFormProps {
    form: FormData;
    handleChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    setForm: React.Dispatch<React.SetStateAction<FormData>>;
    setFormType: React.Dispatch<React.SetStateAction<'visitor' | 'contractor'>>;
    error: string;
    success: string;
    isSubmitting: boolean;  // ✅ Add karo ye line
}

const VisitorForm = ({ form, handleChange, handleSubmit, setForm, setFormType, error, success }: VisitorFormProps) => {
    const [loading, setLoading] = useState(false);
    const [searchEmail, setSearchEmail] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [settings, setSettings] = useState<SystemSettingsType>({
        visitorPhotoRequired: false,
    });
    const [employees, setEmployees] = useState<{ id: string; firstName: string; lastName: string; siteLocation?: string; meetingLocation?: string; }[]>([]);

 console.log(form);
 
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
                alert("No visitor found with that email.");
                return;
            }

            console.log(data);


            // ✅ Set the returned data into your form
            setForm((prevForm) => ({
                ...prevForm,
                ...data,
            }));

            toast.success("Visitor data loaded.");
            alert("Visitor data loaded");
        } catch (err) {
            console.error(err);
            toast.error("Failed to fetch visitor info.");
            alert("Failed to fetch visitor info.")
        } finally {
            setIsSearching(false);
        }
    };

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            await handleSubmit(e);

        } catch (err) {

            console.log(err);

        } finally {
            setLoading(false);
        }
    };



    const MAX_FILE_SIZE_MB = 5;

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
        <main className='min-h-screen bg-gradient-to-br from-white via-indigo-100 to-purple-100 pb-4 sm:pb-8 lg:pb-10'>
            <AppBar />
            <div className='bg-white rounded-xl sm:rounded-3xl shadow-lg p-4 sm:p-6 md:p-8 w-full max-w-8xl mx-2 sm:mx-4 md:mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mt-4 sm:mt-6 not-first:mb-4 sm:pb-8'>

                <div className="p-4 mx-auto space-y-6 bg-white rounded-xl shadow-md mt-2 sm:mt-6 lg:mt-8 xl:mt-10">
                    <h1 className="text-2xl font-bold mb-4">New Visitor</h1>
                    <form onSubmit={onSubmit}>
                        <div className="flex items-center mb-2">
                            <div className="bg-blue-100 p-1.5 sm:p-2 rounded-full mr-2 sm:mr-3 flex-shrink-0">
                                <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-700" />
                            </div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-900 leading-tight">Visitor Registration</h1>
                        </div>
                        <p className="text-sm sm:text-base text-gray-600 mb-2 sm:mb-4">Please fill in your details to register for a visit. Fields marked with * are required.</p>

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
                                                company: "",       
                                                comments: "",   
                                                purpose: '',
                                                department: '',
                                                meetingLocation: '',
                                                visitStartDate: new Date().toISOString().slice(0, 16),
                                                visitEndDate: new Date().toISOString().slice(0, 16),
                                                visitorCategory: 'visitor',
                                                agreed: "",
                                                pics: "",
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


                        {/* Form Data */}

                        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                            <Input name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
                            <Input name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
                            <Input name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} required />
                            <Input name="email" placeholder="Email Address" value={form.email} onChange={handleChange} />

                            <Select value={form.visitorCategory} onValueChange={(value) => setFormType(value as 'visitor' | 'contractor')}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Visitor Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="contractor">Contractor</SelectItem>
                                    <SelectItem value="visitor">Visitor</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={form.siteLocation} onValueChange={(value) => setForm({ ...form, siteLocation: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Site Location" />
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


                            {/* Visitor Photo */}
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

                        </div>

                        <h2 className="text-xl font-semibold mt-6 mb-2">Visit Information</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Select value={form.department} onValueChange={(value) => setForm({ ...form, department: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="HR">HR</SelectItem>
                                    <SelectItem value="IT">IT</SelectItem>
                                    <SelectItem value="Operations">Operations</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={form.hostEmployee} onValueChange={(value) => setForm({ ...form, hostEmployee: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Employee" />
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

                            <Select value={form.meetingLocation} onValueChange={(value) => setForm({ ...form, meetingLocation: value })}>
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

                            <div>
                                <label className="block mb-1">Visit Start Date & Time</label>
                                <Input type="datetime-local" name="visitStartDate" value={form.visitStartDate} onChange={handleChange} />
                            </div>
                            <div>
                                <label className="block mb-1">Visit End Date & Time</label>
                                <Input type="datetime-local" name="visitEndDate" value={form.visitEndDate} onChange={handleChange} />
                            </div>
                        </div>

                        <div className="mt-4">
                            <Textarea
                                name="purpose"
                                placeholder="Please describe the purpose of your visit"
                                value={form.purpose}
                                onChange={handleChange}
                                required
                            />
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
                                        // checked={form.agreed}
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
                            <Button type='submit' className="mt-4 w-full sm:w-auto" disabled={loading}>
                                {loading ? 'Submitting...' : 'Submit'}
                            </Button>
                        </div>
                    </form>

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

export default VisitorForm;
