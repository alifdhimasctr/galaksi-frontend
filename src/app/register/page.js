// "use client";
// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import axios from "axios";
// import toast, { Toaster } from "react-hot-toast";
// import { 
//     FaUser, FaEnvelope, FaLock, FaPhone, FaBookOpen, FaHome, FaBuilding, FaUniversity, 
//     FaArrowLeft, FaBookmark, FaSchool, FaBriefcase, FaLandmark 
// } from "react-icons/fa";
// import Link from "next/link";

// export default function RegisterPage() {
//   const router = useRouter();
//   const [role, setRole] = useState(null);
//   const [loading, setLoading] = useState(false);
  
//   // Form states for each role
//   const [formSiswa, setFormSiswa] = useState({
//     email: "",
//     name: "",
//     noHp: "",
//     gender: "",
//     parentName: "",
//     parentJob: "",
//     address: "",
//     city: "",
//     purpose: "",
//     level: ""
//   });
  
//   const [formTentor, setFormTentor] = useState({
//     name: "",
//     noHp: "",
//     email: "",
//     gender: "",
//     address: "",
//     city: "",
//     faculty: "",
//     university: "",
//     schoolLevel: [],
//     bankName: "",
//     bankNumber: "",
//     foto: null,
//     sim: null
//   });
  
//   const [formMitra, setFormMitra] = useState({
//     name: "",
//     email: "",
//     branch: "",
//     address: "",
//     city: "",
//     noHp: "",
//     bankName: "",
//     bankNumber: ""
//   });

//   // Handle role selection
//   const selectRole = (selectedRole) => {
//     setRole(selectedRole);
//     window.scrollTo(0, 0);
//   };

//   // Handle back to role selection
//   const backToRoleSelect = () => {
//     setRole(null);
//   };

//   // Handle form changes
//   const handleSiswaChange = (e) => {
//     const { name, value } = e.target;
//     setFormSiswa(prev => ({ ...prev, [name]: value }));
//   };

//   const handleTentorChange = (e) => {
//     const { name, value, type } = e.target;
    
//     if (type === "checkbox") {
//       const isChecked = e.target.checked;
//       setFormTentor(prev => {
//         const newLevels = isChecked 
//           ? [...prev.schoolLevel, value]
//           : prev.schoolLevel.filter(lvl => lvl !== value);
//         return { ...prev, schoolLevel: newLevels };
//       });
//     } else if (name === "foto" || name === "sim") {
//       setFormTentor(prev => ({ ...prev, [name]: e.target.files[0] }));
//     } else {
//       setFormTentor(prev => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleMitraChange = (e) => {
//     const { name, value } = e.target;
//     setFormMitra(prev => ({ ...prev, [name]: value }));
//   };

//   // Handle form submissions
//   const submitSiswa = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     try {
//       await axios.post(
//         `${process.env.NEXT_PUBLIC_API_BASE_URL}/register/siswa`,
//         formSiswa
//       );
//       toast.success("Registrasi siswa berhasil!");
//       setTimeout(() => router.push("/login"), 1500);
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Registrasi gagal");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const submitTentor = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     try {
//       const formData = new FormData();
//       Object.entries(formTentor).forEach(([key, value]) => {
//         if (key === "schoolLevel") {
//           formData.append(key, JSON.stringify(value));
//         } else {
//           formData.append(key, value);
//         }
//       });
      
//       await axios.post(
//         `${process.env.NEXT_PUBLIC_API_BASE_URL}/register/tentor`,
//         formData,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );
//       toast.success("Registrasi tentor berhasil!");
//       setTimeout(() => router.push("/login"), 1500);
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Registrasi gagal");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const submitMitra = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     try {
//       await axios.post(
//         `${process.env.NEXT_PUBLIC_API_BASE_URL}/register/mitra`,
//         formMitra
//       );
//       toast.success("Registrasi mitra berhasil!");
//       setTimeout(() => router.push("/login"), 1500);
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Registrasi gagal");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Render role selection view
//   if (!role) {
//     return (
//       <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-indigo-50 to-purple-50">
//         <Toaster position="top-right" />
        
//         {/* Left Panel */}
//         <div className="hidden md:flex w-1/2 bg-gradient-to-br from-indigo-600 to-purple-800 items-center justify-center p-12">
//           <div className="text-white text-center max-w-md">
//             <FaUser className="h-16 w-16 mx-auto mb-6" />
//             <h1 className="text-4xl font-bold mb-4">Buat Akun Baru</h1>
//             <p className="text-lg opacity-90">
//               Bergabunglah dengan kami sebagai siswa, tentor, atau mitra pendidikan. 
//               Mulai perjalanan belajar mengajar Anda sekarang!
//             </p>
//           </div>
//         </div>
        
//         {/* Right Panel - Role Selection */}
//         <div className="flex-1 flex items-center justify-center p-6">
//           <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
//             <div className="text-center mb-10">
//               <h1 className="text-3xl font-bold text-gray-800">Daftar Akun</h1>
//               <p className="text-gray-500 mt-2">
//                 Pilih peran Anda untuk melanjutkan registrasi
//               </p>
//             </div>
            
//             <div className="space-y-5">
//               {/* Siswa Card */}
//               <div 
//                 onClick={() => selectRole("siswa")}
//                 className="p-6 border border-gray-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-all duration-300 group"
//               >
//                 <div className="flex items-start">
//                   <div className="bg-indigo-100 p-3 rounded-lg group-hover:bg-indigo-200 transition-colors">
//                     <FaSchool className="h-8 w-8 text-indigo-600" />
//                   </div>
//                   <div className="ml-4">
//                     <h3 className="font-semibold text-lg text-gray-800">Siswa</h3>
//                     <p className="text-gray-500 mt-1 text-sm">
//                       Daftar sebagai siswa untuk mengakses materi belajar dan bimbingan
//                     </p>
//                   </div>
//                 </div>
//               </div>
              
//               {/* Tentor Card */}
//               <div 
//                 onClick={() => selectRole("tentor")}
//                 className="p-6 border border-gray-200 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all duration-300 group"
//               >
//                 <div className="flex items-start">
//                   <div className="bg-purple-100 p-3 rounded-lg group-hover:bg-purple-200 transition-colors">
//                     <FaBookOpen className="h-8 w-8 text-purple-600" />
//                   </div>
//                   <div className="ml-4">
//                     <h3 className="font-semibold text-lg text-gray-800">Tentor</h3>
//                     <p className="text-gray-500 mt-1 text-sm">
//                       Daftar sebagai tentor untuk membagikan pengetahuan dan mengajar siswa
//                     </p>
//                   </div>
//                 </div>
//               </div>
              
//               {/* Mitra Card */}
//               <div 
//                 onClick={() => selectRole("mitra")}
//                 className="p-6 border border-gray-200 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-all duration-300 group"
//               >
//                 <div className="flex items-start">
//                   <div className="bg-amber-100 p-3 rounded-lg group-hover:bg-amber-200 transition-colors">
//                     <FaBuilding className="h-8 w-8 text-amber-600" />
//                   </div>
//                   <div className="ml-4">
//                     <h3 className="font-semibold text-lg text-gray-800">Mitra</h3>
//                     <p className="text-gray-500 mt-1 text-sm">
//                       Daftar sebagai mitra untuk mengelola lembaga pendidikan dan tentor
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
            
//             <div className="mt-8 text-center">
//               <p className="text-gray-600">
//                 Sudah punya akun?{" "}
//                 <Link href="/login" className="text-indigo-600 font-medium hover:underline">
//                   Masuk disini
//                 </Link>
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Render form based on selected role
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 py-10">
//       <Toaster position="top-right" />
      
//       <div className="max-w-4xl mx-auto px-4">
//         <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//           {/* Form Header */}
//           <div className={`p-6 text-white ${
//             role === "siswa" ? "bg-indigo-600" : 
//             role === "tentor" ? "bg-purple-600" : "bg-amber-600"
//           }`}>
//             <button 
//               onClick={backToRoleSelect}
//               className="flex items-center text-white/90 hover:text-white mb-4"
//             >
//                 <FaArrowLeft className="h-5 w-5 mr-2" />
//             </button>
            
//             <div className="flex items-center">
//               <div className="bg-white/20 p-3 rounded-lg mr-4">
//                 {role === "siswa" && <FaSchool className="h-8 w-8 text-indigo-600" />}
//                 {role === "tentor" && <FaBookOpen className="h-8 w-8 text-purple-600" />}
//                 {role === "mitra" && <FaBuilding className="h-8 w-8 text-amber-600" />}
//               </div>
//               <div>
//                 <h1 className="text-2xl font-bold">
//                   Registrasi sebagai {role.charAt(0).toUpperCase() + role.slice(1)}
//                 </h1>
//                 <p className="opacity-90 mt-1">
//                   Silahkan lengkapi form dibawah untuk membuat akun baru
//                 </p>
//               </div>
//             </div>
//           </div>
          
//           {/* Form Content */}
//           <div className="p-6 md:p-8">
//             {role === "siswa" && (
//               <form onSubmit={submitSiswa}>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="md:col-span-2">
//                     <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
//                         <FaUser className="h-5 w-5 mr-2 text-indigo-600" />
//                       Informasi Pribadi
//                     </h2>
//                   </div>
                  
//                   <div className="relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
//                     <div className="relative">
//                       <FaUser className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                       <input
//                         name="name"
//                         type="text"
//                         required
//                         value={formSiswa.name}
//                         onChange={handleSiswaChange}
//                         placeholder="Nama lengkap"
//                         className="w-full pl-10 rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                       />
//                     </div>
//                   </div>
                  
//                   <div className="relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//                     <div className="relative">
//                         <FaEnvelope className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                       <input
//                         name="email"
//                         type="email"
//                         required
//                         value={formSiswa.email}
//                         onChange={handleSiswaChange}
//                         placeholder="Email aktif"
//                         className="w-full pl-10 rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                       />
//                     </div>
//                   </div>
                  
//                   <div className="relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">No. Handphone</label>
//                     <div className="relative">
//                         <FaPhone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                       <input
//                         name="noHp"
//                         type="tel"
//                         required
//                         value={formSiswa.noHp}
//                         onChange={handleSiswaChange}
//                         placeholder="081234567890"
//                         className="w-full pl-10 rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                       />
//                     </div>
//                   </div>
                  
//                   <div className="relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
//                     <div className="flex space-x-4 mt-1">
//                       <label className="flex items-center">
//                         <input
//                           type="radio"
//                           name="gender"
//                           value="L"
//                           checked={formSiswa.gender === "L"}
//                           onChange={handleSiswaChange}
//                           className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
//                         />
//                         <span className="ml-2 text-gray-700">Laki-laki</span>
//                       </label>
//                       <label className="flex items-center">
//                         <input
//                           type="radio"
//                           name="gender"
//                           value="P"
//                           checked={formSiswa.gender === "P"}
//                           onChange={handleSiswaChange}
//                           className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
//                         />
//                         <span className="ml-2 text-gray-700">Perempuan</span>
//                       </label>
//                     </div>
//                   </div>
                  
//                   <div className="md:col-span-2 mt-4">
//                     <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
//                       <FaHome className="h-5 w-5 mr-2 text-indigo-600" />
//                       Informasi Alamat
//                     </h2>
//                   </div>
                  
//                   <div className="md:col-span-2 relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
//                     <textarea
//                       name="address"
//                       required
//                       value={formSiswa.address}
//                       onChange={handleSiswaChange}
//                       placeholder="Jl. Merdeka No. 10"
//                       rows="2"
//                       className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     ></textarea>
//                   </div>
                  
//                   <div className="relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
//                     <input
//                       name="city"
//                       type="text"
//                       required
//                       value={formSiswa.city}
//                       onChange={handleSiswaChange}
//                       placeholder="Kota tempat tinggal"
//                       className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     />
//                   </div>
                  
//                   <div className="relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Jenjang Pendidikan</label>
//                     <select
//                       name="level"
//                       required
//                       value={formSiswa.level}
//                       onChange={handleSiswaChange}
//                       className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     >
//                       <option value="">Pilih jenjang</option>
//                       <option value="SD">SD</option>
//                       <option value="SMP">SMP</option>
//                       <option value="SMA">SMA</option>
//                       <option value="Kuliah">Kuliah</option>
//                     </select>
//                   </div>
                  
//                   <div className="md:col-span-2 mt-4">
//                     <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
//                       <FaUser className="h-5 w-5 mr-2 text-indigo-600" />
//                       Informasi Orang Tua
//                     </h2>
//                   </div>
                  
//                   <div className="relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Nama Orang Tua</label>
//                     <input
//                       name="parentName"
//                       type="text"
//                       required
//                       value={formSiswa.parentName}
//                       onChange={handleSiswaChange}
//                       placeholder="Nama lengkap orang tua"
//                       className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     />
//                   </div>
                  
//                   <div className="relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Pekerjaan Orang Tua</label>
//                     <input
//                       name="parentJob"
//                       type="text"
//                       required
//                       value={formSiswa.parentJob}
//                       onChange={handleSiswaChange}
//                       placeholder="Pekerjaan orang tua"
//                       className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     />
//                   </div>
                  
//                   <div className="md:col-span-2 relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Tujuan Bergabung
//                     </label>
//                     <textarea
//                       name="purpose"
//                       required
//                       value={formSiswa.purpose}
//                       onChange={handleSiswaChange}
//                       placeholder="Tujuan Anda bergabung dengan platform ini"
//                       rows="3"
//                       className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     ></textarea>
//                   </div>
//                 </div>
                
//                 <div className="mt-8">
//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-70"
//                   >
//                     {loading ? (
//                       <>
//                         <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
//                         Memproses...
//                       </>
//                     ) : "Daftar sebagai Siswa"}
//                   </button>
//                 </div>
//               </form>
//             )}
            
//             {role === "tentor" && (
//               <form onSubmit={submitTentor}>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="md:col-span-2">
//                     <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
//                       <FaUser className="h-5 w-5 mr-2 text-purple-600" />
//                       Informasi Pribadi
//                     </h2>
//                   </div>
                  
//                   <div className="relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
//                     <div className="relative">
//                       <FaUser className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                       <input
//                         name="name"
//                         type="text"
//                         required
//                         value={formTentor.name}
//                         onChange={handleTentorChange}
//                         placeholder="Nama lengkap"
//                         className="w-full pl-10 rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
//                       />
//                     </div>
//                   </div>
                  
//                   <div className="relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//                     <div className="relative">
//                       <FaEnvelope className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                       <input
//                         name="email"
//                         type="email"
//                         required
//                         value={formTentor.email}
//                         onChange={handleTentorChange}
//                         placeholder="Email aktif"
//                         className="w-full pl-10 rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
//                       />
//                     </div>
//                   </div>
                  
//                   <div className="relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">No. Handphone</label>
//                     <div className="relative">
//                       <FaPhone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                       <input
//                         name="noHp"
//                         type="tel"
//                         required
//                         value={formTentor.noHp}
//                         onChange={handleTentorChange}
//                         placeholder="081234567890"
//                         className="w-full pl-10 rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
//                       />
//                     </div>
//                   </div>
                  
//                   <div className="relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
//                     <div className="flex space-x-4 mt-1">
//                       <label className="flex items-center">
//                         <input
//                           type="radio"
//                           name="gender"
//                           value="L"
//                           checked={formTentor.gender === "L"}
//                           onChange={handleTentorChange}
//                           className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
//                         />
//                         <span className="ml-2 text-gray-700">Laki-laki</span>
//                       </label>
//                       <label className="flex items-center">
//                         <input
//                           type="radio"
//                           name="gender"
//                           value="P"
//                           checked={formTentor.gender === "P"}
//                           onChange={handleTentorChange}
//                           className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
//                         />
//                         <span className="ml-2 text-gray-700">Perempuan</span>
//                       </label>
//                     </div>
//                   </div>
                  
//                   <div className="md:col-span-2 mt-4">
//                     <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
//                       <FaHome className="h-5 w-5 mr-2 text-purple-600" />
//                       Informasi Alamat
//                     </h2>
//                   </div>
                  
//                   <div className="md:col-span-2 relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
//                     <textarea
//                       name="address"
//                       required
//                       value={formTentor.address}
//                       onChange={handleTentorChange}
//                       placeholder="Alamat tempat tinggal"
//                       rows="2"
//                       className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
//                     ></textarea>
//                   </div>
                  
//                   <div className="relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
//                     <input
//                       name="city"
//                       type="text"
//                       required
//                       value={formTentor.city}
//                       onChange={handleTentorChange}
//                       placeholder="Kota tempat tinggal"
//                       className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
//                     />
//                   </div>
                  
//                   <div className="md:col-span-2 mt-4">
//                     <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
//                       <FaBookOpen className="h-5 w-5 mr-2 text-purple-600" />
//                       Informasi Pendidikan
//                     </h2>
//                   </div>
                  
//                   <div className="relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Universitas</label>
//                     <input
//                       name="university"
//                       type="text"
//                       required
//                       value={formTentor.university}
//                       onChange={handleTentorChange}
//                       placeholder="Nama universitas"
//                       className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
//                     />
//                   </div>
                  
//                   <div className="relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Fakultas</label>
//                     <input
//                       name="faculty"
//                       type="text"
//                       required
//                       value={formTentor.faculty}
//                       onChange={handleTentorChange}
//                       placeholder="Fakultas"
//                       className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
//                     />
//                   </div>
                  
//                   <div className="md:col-span-2 relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Jenjang yang Diajarkan
//                     </label>
//                     <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
//                       {["TK", "SD", "SMP", "SMA"].map(level => (
//                         <label key={level} className="flex items-center">
//                           <input
//                             type="checkbox"
//                             name="schoolLevel"
//                             value={level}
//                             checked={formTentor.schoolLevel.includes(level)}
//                             onChange={handleTentorChange}
//                             className="h-4 w-4 text-purple-600 border-gray-300 focus:ring-purple-500"
//                           />
//                           <span className="ml-2 text-gray-700">{level}</span>
//                         </label>
//                       ))}
//                     </div>
//                   </div>
                  
//                   <div className="md:col-span-2 mt-4">
//                     <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
//                       <FaBuilding className="h-5 w-5 mr-2 text-purple-600" />
//                       Informasi Bank
//                     </h2>
//                   </div>
                  
//                   <div className="relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bank</label>
//                     <select
//                       name="bankName"
//                       required
//                       value={formTentor.bankName}
//                       onChange={handleTentorChange}
//                       className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
//                     >
//                       <option value="">Pilih bank</option>
//                       <option value="BRI">BRI</option>
//                       <option value="BCA">BCA</option>
//                       <option value="Mandiri">Mandiri</option>
//                       <option value="BNI">BNI</option>
//                     </select>
//                   </div>
                  
//                   <div className="relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Rekening</label>
//                     <input
//                       name="bankNumber"
//                       type="text"
//                       required
//                       value={formTentor.bankNumber}
//                       onChange={handleTentorChange}
//                       placeholder="Nomor rekening"
//                       className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500"
//                     />
//                   </div>
                  
//                   <div className="md:col-span-2 mt-4">
//                     <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
//                       <FaBookmark className="h-5 w-5 mr-2 text-purple-600" />
//                       Dokumen Pendukung
//                     </h2>
//                   </div>
                  
//                   <div className="relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Foto Profil
//                       <span className="text-xs text-gray-500 ml-1">(JPG/PNG, max 2MB)</span>
//                     </label>
//                     <input
//                       name="foto"
//                       type="file"
//                       required
//                       onChange={handleTentorChange}
//                       accept="image/*"
//                       className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
//                     />
//                   </div>
                  
//                   <div className="relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                       Dokumen Identitas
//                       <span className="text-xs text-gray-500 ml-1">(KTP/SIM, max 2MB)</span>
//                     </label>
//                     <input
//                       name="sim"
//                       type="file"
//                       required
//                       onChange={handleTentorChange}
//                       accept="image/*,application/pdf"
//                       className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
//                     />
//                   </div>
//                 </div>
                
//                 <div className="mt-8">
//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-600 py-3 font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-70"
//                   >
//                     {loading ? (
//                       <>
//                         <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
//                         Memproses...
//                       </>
//                     ) : "Daftar sebagai Tentor"}
//                   </button>
//                 </div>
//               </form>
//             )}
            
//             {role === "mitra" && (
//               <form onSubmit={submitMitra}>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="md:col-span-2">
//                     <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
//                       <FaBuilding className="h-5 w-5 mr-2 text-amber-600" />
//                       Informasi Lembaga
//                     </h2>
//                   </div>
                  
//                   <div className="md:col-span-2 relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lembaga</label>
//                     <div className="relative">
//                       <FaBuilding className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                       <input
//                         name="name"
//                         type="text"
//                         required
//                         value={formMitra.name}
//                         onChange={handleMitraChange}
//                         placeholder="Nama lembaga pendidikan"
//                         className="w-full pl-10 rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
//                       />
//                     </div>
//                   </div>
                  
//                   <div className="relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//                     <div className="relative">
//                       <FaEnvelope className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                       <input
//                         name="email"
//                         type="email"
//                         required
//                         value={formMitra.email}
//                         onChange={handleMitraChange}
//                         placeholder="Email aktif lembaga"
//                         className="w-full pl-10 rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
//                       />
//                     </div>
//                   </div>
                  
//                   <div className="relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Cabang</label>
//                     <input
//                       name="branch"
//                       type="text"
//                       required
//                       value={formMitra.branch}
//                       onChange={handleMitraChange}
//                       placeholder="Cabang lembaga"
//                       className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
//                     />
//                   </div>
                  
//                   <div className="md:col-span-2 mt-4">
//                     <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
//                       <FaHome className="h-5 w-5 mr-2 text-amber-600" />
//                       Informasi Alamat
//                     </h2>
//                   </div>
                  
//                   <div className="md:col-span-2 relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
//                     <textarea
//                       name="address"
//                       required
//                       value={formMitra.address}
//                       onChange={handleMitraChange}
//                       placeholder="Alamat lengkap lembaga"
//                       rows="2"
//                       className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
//                     ></textarea>
//                   </div>
                  
//                   <div className="relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
//                     <input
//                       name="city"
//                       type="text"
//                       required
//                       value={formMitra.city}
//                       onChange={handleMitraChange}
//                       placeholder="Kota lokasi lembaga"
//                       className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
//                     />
//                   </div>
                  
//                   <div className="relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon</label>
//                     <div className="relative">
//                       <FaPhone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                       <input
//                         name="noHp"
//                         type="tel"
//                         required
//                         value={formMitra.noHp}
//                         onChange={handleMitraChange}
//                         placeholder="Nomor telepon lembaga"
//                         className="w-full pl-10 rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
//                       />
//                     </div>
//                   </div>
                  
//                   <div className="md:col-span-2 mt-4">
//                     <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
//                       <FaBuilding className="h-5 w-5 mr-2 text-amber-600" />
//                       Informasi Rekening
//                     </h2>
//                   </div>
                  
//                   <div className="relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bank</label>
//                     <select
//                       name="bankName"
//                       required
//                       value={formMitra.bankName}
//                       onChange={handleMitraChange}
//                       className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
//                     >
//                       <option value="">Pilih bank</option>
//                       <option value="BRI">BRI</option>
//                       <option value="BCA">BCA</option>
//                       <option value="Mandiri">Mandiri</option>
//                       <option value="BNI">BNI</option>
//                     </select>
//                   </div>
                  
//                   <div className="relative">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Rekening</label>
//                     <input
//                       name="bankNumber"
//                       type="text"
//                       required
//                       value={formMitra.bankNumber}
//                       onChange={handleMitraChange}
//                       placeholder="Nomor rekening lembaga"
//                       className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
//                     />
//                   </div>
//                 </div>
                
//                 <div className="mt-8">
//                   <button
//                     type="submit"
//                     disabled={loading}
//                     className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-600 py-3 font-medium text-white hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-70"
//                   >
//                     {loading ? (
//                       <>
//                         <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
//                         Memproses...
//                       </>
//                     ) : "Daftar sebagai Mitra"}
//                   </button>
//                 </div>
//               </form>
//             )}
//           </div>
//         </div>
        
//         <div className="mt-6 text-center">
//           <p className="text-gray-600">
//             Sudah punya akun?{" "}
//             <Link href="/login" className="text-indigo-600 font-medium hover:underline">
//               Masuk disini
//             </Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

import React from 'react'

export default function page() {
  return (
    <div>Dalam Perbaikan</div>
  )
}
