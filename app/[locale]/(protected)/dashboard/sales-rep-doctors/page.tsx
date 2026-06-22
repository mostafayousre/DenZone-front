"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Doctor {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes: string;
  createdAt: string;
}

const LOCAL_STORAGE_KEY = "denzone_sales_rep_doctors";

const initialMockDoctors: Doctor[] = [
  {
    id: "1",
    name: "Dr. Ahmed Ali",
    phone: "+201012345678",
    address: "12 El-Galaa St, Cairo, Egypt",
    notes: "Preferably contacted in the afternoon. Interested in new dental implants.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Dr. Sarah Mohamed",
    phone: "+201287654321",
    address: "45 El-Batal Ahmed St, Giza, Egypt",
    notes: "Clinic open from 5 PM to 10 PM. Regularly orders composite fillings.",
    createdAt: new Date().toISOString(),
  },
];

export default function SalesRepDoctorsPage({ params }: { params: { locale: string } }) {
  const isAr = params?.locale === "ar";

  // Localization Dictionary
  const dict = {
    title: isAr ? "أطباء المندوبين" : "Sales Rep Doctors",
    subtitle: isAr ? "إدارة وتتبع بيانات الأطباء والعملاء المحتملين" : "Manage and track doctors and client leads info",
    addDoctor: isAr ? "إضافة طبيب جديد" : "Add New Doctor",
    editDoctor: isAr ? "تعديل بيانات الطبيب" : "Edit Doctor Details",
    searchPlaceholder: isAr ? "البحث بالاسم، الهاتف، أو العنوان..." : "Search by name, phone, or address...",
    doctorName: isAr ? "اسم الطبيب" : "Doctor Name",
    phone: isAr ? "رقم الهاتف" : "Phone Number",
    address: isAr ? "العنوان" : "Address",
    notes: isAr ? "ملاحظات" : "Notes",
    actions: isAr ? "الإجراءات" : "Actions",
    save: isAr ? "حفظ" : "Save",
    cancel: isAr ? "إلغاء" : "Cancel",
    deleteConfirmTitle: isAr ? "حذف الطبيب" : "Delete Doctor",
    deleteConfirmDesc: isAr ? "هل أنت متأكد من حذف هذا الطبيب؟ لا يمكن التراجع عن هذا الإجراء." : "Are you sure you want to delete this doctor? This action cannot be undone.",
    noDoctors: isAr ? "لم يتم العثور على أطباء" : "No doctors found",
    successAdd: isAr ? "تم إضافة الطبيب بنجاح" : "Doctor added successfully",
    successUpdate: isAr ? "تم تحديث بيانات الطبيب بنجاح" : "Doctor updated successfully",
    successDelete: isAr ? "تم حذف الطبيب بنجاح" : "Doctor deleted successfully",
    errorRequired: isAr ? "جميع الحقول مطلوبة" : "Name, Phone and Address are required",
  };

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });

  // Load from local storage
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      try {
        setDoctors(JSON.parse(stored));
      } catch (e) {
        setDoctors(initialMockDoctors);
      }
    } else {
      setDoctors(initialMockDoctors);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialMockDoctors));
    }
  }, []);

  const saveToStorage = (updatedList: Doctor[]) => {
    setDoctors(updatedList);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedList));
  };

  const handleOpenAdd = () => {
    setSelectedDoctor(null);
    setFormData({ name: "", phone: "", address: "", notes: "" });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setFormData({
      name: doctor.name,
      phone: doctor.phone,
      address: doctor.address,
      notes: doctor.notes,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.address.trim()) {
      toast.error(dict.errorRequired);
      return;
    }

    if (selectedDoctor) {
      // Edit
      const updated = doctors.map((doc) =>
        doc.id === selectedDoctor.id
          ? { ...doc, ...formData }
          : doc
      );
      saveToStorage(updated);
      toast.success(dict.successUpdate);
    } else {
      // Add
      const newDoctor: Doctor = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        createdAt: new Date().toISOString(),
      };
      saveToStorage([newDoctor, ...doctors]);
      toast.success(dict.successAdd);
    }
    setIsDialogOpen(false);
  };

  const handleDelete = () => {
    if (selectedDoctor) {
      const updated = doctors.filter((doc) => doc.id !== selectedDoctor.id);
      saveToStorage(updated);
      toast.success(dict.successDelete);
      setIsDeleteDialogOpen(false);
    }
  };

  const filteredDoctors = doctors.filter((doc) => {
    const search = searchTerm.toLowerCase();
    return (
      doc.name.toLowerCase().includes(search) ||
      doc.phone.toLowerCase().includes(search) ||
      doc.address.toLowerCase().includes(search) ||
      doc.notes.toLowerCase().includes(search)
    );
  });

  return (
    <div className="space-y-6 p-1 md:p-6" dir={isAr ? "rtl" : "ltr"}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Icon icon="heroicons-outline:users" className="h-8 w-8 text-primary" />
            {dict.title}
          </h1>
          <p className="text-muted-foreground mt-1">{dict.subtitle}</p>
        </div>
        <Button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-primary hover:bg-primary/95 text-white shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Icon icon="heroicons-outline:plus" className="h-5 w-5" />
          {dict.addDoctor}
        </Button>
      </div>

      <Card className="border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
        <CardHeader className="pb-4">
          <div className="relative">
            <Icon
              icon="heroicons-outline:search"
              className={`absolute top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5 ${
                isAr ? "right-3" : "left-3"
              }`}
            />
            <Input
              type="text"
              placeholder={dict.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full max-w-md ${isAr ? "pr-10" : "pl-10"} bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-primary`}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-slate-850">
                <TableRow>
                  <TableHead className="font-semibold">{dict.doctorName}</TableHead>
                  <TableHead className="font-semibold">{dict.phone}</TableHead>
                  <TableHead className="font-semibold">{dict.address}</TableHead>
                  <TableHead className="font-semibold max-w-xs">{dict.notes}</TableHead>
                  <TableHead className="text-center font-semibold w-32">{dict.actions}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {filteredDoctors.length > 0 ? (
                    filteredDoctors.map((doc) => (
                      <motion.tr
                        key={doc.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800/80 transition-colors"
                      >
                        <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {doc.name.charAt(0).toUpperCase()}
                            </div>
                            {doc.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-700 dark:text-slate-300 font-mono">
                          {doc.phone}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400 max-w-[200px] truncate">
                          {doc.address}
                        </TableCell>
                        <TableCell className="text-slate-500 dark:text-slate-500 max-w-xs truncate" title={doc.notes}>
                          {doc.notes || "-"}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(doc)}
                              className="h-8 w-8 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full"
                            >
                              <Icon icon="heroicons-outline:pencil" className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedDoctor(doc);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="h-8 w-8 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full"
                            >
                              <Icon icon="heroicons-outline:trash" className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                        <Icon icon="heroicons-outline:inbox" className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700 mb-2" />
                        {dict.noDoctors}
                      </TableCell>
                    </TableRow>
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]" dir={isAr ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Icon
                icon={selectedDoctor ? "heroicons-outline:pencil-alt" : "heroicons-outline:user-add"}
                className="text-primary h-6 w-6"
              />
              {selectedDoctor ? dict.editDoctor : dict.addDoctor}
            </DialogTitle>
            <DialogDescription>
              {isAr ? "أدخل تفاصيل الطبيب أدناه ثم انقر على حفظ." : "Enter doctor detail inputs below and click save."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">{dict.doctorName} <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={isAr ? "د. أحمد علي" : "Dr. John Doe"}
                required
                className="col-span-3 bg-white dark:bg-slate-800"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">{dict.phone} <span className="text-red-500">*</span></Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+201000000000"
                required
                className="col-span-3 bg-white dark:bg-slate-800"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">{dict.address} <span className="text-red-500">*</span></Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder={isAr ? "العنوان بالتفصيل..." : "123 Main St, City"}
                required
                className="col-span-3 bg-white dark:bg-slate-800"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">{dict.notes}</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={isAr ? "ملاحظات إضافية..." : "Additional details, orders, preferences..."}
                className="col-span-3 bg-white dark:bg-slate-800 min-h-[100px]"
              />
            </div>
            <DialogFooter className="gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                {dict.cancel}
              </Button>
              <Button type="submit" className="bg-primary text-white hover:bg-primary/95">
                {dict.save}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]" dir={isAr ? "rtl" : "ltr"}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
              <Icon icon="heroicons-outline:exclamation" className="h-6 w-6" />
              {dict.deleteConfirmTitle}
            </DialogTitle>
            <DialogDescription className="pt-2">
              {dict.deleteConfirmDesc}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {dict.cancel}
            </Button>
            <Button type="button" variant="soft" onClick={handleDelete}>
              {isAr ? "حذف" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
