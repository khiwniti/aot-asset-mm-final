import { useState } from 'react';
import Header from '../components/Header';
import AIAssistButton from '../components/AIAssistButton';
import { LEASES } from '../services/mockData';
import { Clock, AlertCircle, UserPlus, CheckCircle2, Send, FileCheck, ArrowRight } from 'lucide-react';
import { Lease } from '../types';
import LeaseManager from '../components/LeaseManager';

const LeasingManagement = () => {
  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Header title="Leasing Management" subtitle="Manage tenants, leases, vacancies and renewals." />
      
      <main className="p-8 max-w-[1600px] mx-auto">
        <LeaseManager />
      </main>
    </div>
  );
};

export default LeasingManagement;