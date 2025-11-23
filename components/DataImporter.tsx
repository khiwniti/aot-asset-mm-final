import { useState, useRef, useEffect, type DragEvent, type ChangeEvent } from 'react';
import { 
  UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, 
  ArrowRight, RefreshCw, Database, Sparkles, FileText, Activity, Layout, X, Loader2
} from 'lucide-react';
import { analyzeDataMapping } from '../services/geminiService';
import { ImportJob } from '../types';

const DataImporter = () => {
  const [importJob, setImportJob] = useState<ImportJob | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulate progress bar during analysis
  useEffect(() => {
    if (importJob?.status === 'analyzing') {
      setAnalysisProgress(0);
      const interval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90; // Wait for actual completion
          }
          return prev + 10;
        });
      }, 500);
      return () => clearInterval(interval);
    }
  }, [importJob?.status]);

  const handleFileSelect = (e: DragEvent | ChangeEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    let file: File | null = null;
    if ('dataTransfer' in e) {
        file = (e as DragEvent).dataTransfer.files[0];
    } else if ('target' in e) {
        file = (e.target as HTMLInputElement).files?.[0] || null;
    }

    if (file) {
      setPendingFile(file);
      setShowConfirmation(true);
    }
  };

  const confirmUpload = async () => {
    if (!pendingFile) return;
    
    setShowConfirmation(false);

    // 1. Initialize Job
    setImportJob({
      id: 'job-' + Date.now(),
      fileName: pendingFile.name,
      fileSize: (pendingFile.size / (1024 * 1024)).toFixed(2) + ' MB',
      uploadDate: new Date().toISOString(),
      status: 'analyzing', // Start immediately with AI analysis
      mappings: []
    });

    // 2. Extract Headers
    let headers: string[] = [];

    if (pendingFile.name.toLowerCase().endsWith('.csv')) {
        try {
            const text = await pendingFile.text();
            const firstLine = text.split('\n')[0];
            if (firstLine) {
                headers = firstLine.split(',').map(h => h.trim().replace(/^"|"$/g, ''));
            }
        } catch (err) {
            console.error("Error reading CSV", err);
            headers = ['Column_1', 'Column_2', 'Column_3'];
        }
    } else {
        // Simulation for Excel/PDF/Other formats
        await new Promise(resolve => setTimeout(resolve, 1500));
        headers = ['Legacy_ID', 'Property_Name', 'Address_Line_1', 'Monthly_Rent_Amt', 'Lease_End_Date', 'Tenant_Status'];
    }

    // 3. Trigger AI Analysis
    triggerAIAnalysis(headers, pendingFile.name);
  };

  const cancelUpload = () => {
    setPendingFile(null);
    setShowConfirmation(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const triggerAIAnalysis = async (headers: string[], fileName: string) => {
    try {
      const mappings = await analyzeDataMapping(headers, fileName);
      setAnalysisProgress(100);
      setTimeout(() => {
        setImportJob(prev => prev ? { ...prev, status: 'mapping', mappings } : null);
      }, 500);
    } catch (error) {
      console.error("Mapping Error", error);
      setImportJob(prev => prev ? { ...prev, status: 'error' } : null);
    }
  };

  const handleImport = () => {
     // In a real app, this would send the file + mapping to the backend
     setImportJob(prev => prev ? { ...prev, status: 'completed' } : null);
  };

  const resetUpload = () => {
      setImportJob(null);
      setPendingFile(null);
      if (fileInputRef.current) {
          fileInputRef.current.value = '';
      }
  };

  const getConfidenceColor = (score: number) => {
     if (score >= 90) return 'text-green-600 bg-green-50 border-green-100';
     if (score >= 70) return 'text-amber-600 bg-amber-50 border-amber-100';
     return 'text-red-600 bg-red-50 border-red-100';
  };

  return (
    <div className="space-y-8 animate-in fade-in">
       {/* Introduction Card */}
       <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white flex justify-between items-center shadow-lg">
          <div>
             <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Sparkles className="text-yellow-300" /> Data Platform Intelligence
             </h2>
             <p className="text-blue-100 max-w-2xl">
                Import assets, leases, and financial records from any format (CSV, Excel, PDF). 
                Our AI engine automatically maps your data to the AOT system schema 
                and validates integrity before import.
             </p>
          </div>
          <div className="hidden md:block opacity-20">
             <Database size={120} />
          </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Upload Area */}
          <div className="lg:col-span-2 space-y-6">
             
             {/* Confirmation Modal / Overlay */}
             {showConfirmation && pendingFile && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-6 animate-in zoom-in-95 duration-200">
                   <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
                         <AlertTriangle size={24} />
                      </div>
                      <div>
                         <h3 className="font-bold text-lg text-slate-900">Confirm File Upload</h3>
                         <p className="text-slate-500 text-sm mt-1">
                            You are about to upload <strong>{pendingFile.name}</strong> ({(pendingFile.size / 1024).toFixed(1)} KB). 
                            Please verify this is the correct dataset before proceeding to AI analysis.
                         </p>
                      </div>
                   </div>
                   <div className="flex justify-end gap-3">
                      <button 
                         onClick={cancelUpload}
                         className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                      >
                         Cancel
                      </button>
                      <button 
                         onClick={confirmUpload}
                         className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-sm transition-colors flex items-center gap-2"
                      >
                         Confirm & Analyze <ArrowRight size={16} />
                      </button>
                   </div>
                </div>
             )}

             {(!importJob || importJob.status === 'uploading') && !showConfirmation && (
                 <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleFileSelect}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer group
                       ${isDragOver 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-white'}`}
                 >
                    <input 
                       type="file" 
                       ref={fileInputRef}
                       onChange={handleFileSelect}
                       className="hidden" 
                       accept=".csv,.xlsx,.xls,.pdf" 
                    />
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                       <UploadCloud size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Click to upload or drag and drop</h3>
                    <p className="text-slate-500 mb-6">Supported formats: CSV, Excel, PDF (max 50MB)</p>
                    <div className="flex justify-center gap-4">
                       <span className="px-3 py-1 bg-slate-100 rounded text-xs text-slate-500 font-medium flex items-center gap-1"><FileSpreadsheet size={12}/> Spreadsheet</span>
                       <span className="px-3 py-1 bg-slate-100 rounded text-xs text-slate-500 font-medium flex items-center gap-1"><FileText size={12}/> Documents</span>
                       <span className="px-3 py-1 bg-slate-100 rounded text-xs text-slate-500 font-medium flex items-center gap-1"><Database size={12}/> SQL Dump</span>
                    </div>
                 </div>
             )} 
             
             {importJob && (
                 <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    {/* Job Header */}
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                             <FileSpreadsheet size={24} />
                          </div>
                          <div>
                             <h3 className="font-bold text-slate-800">{importJob.fileName}</h3>
                             <p className="text-xs text-slate-500">{importJob.fileSize} • Uploaded {new Date(importJob.uploadDate).toLocaleTimeString()}</p>
                          </div>
                       </div>
                       <div className="flex items-center gap-3">
                          {importJob.status === 'completed' ? (
                             <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center gap-1">
                                <CheckCircle2 size={14} /> Import Complete
                             </span>
                          ) : (
                             <button onClick={resetUpload} className="text-slate-400 hover:text-slate-600">
                                <X size={20} />
                             </button>
                          )}
                       </div>
                    </div>

                    {/* Analysis State with Progress Bar */}
                    {importJob.status === 'analyzing' && (
                       <div className="p-12 text-center">
                          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                             <Loader2 size={32} className="animate-spin" />
                          </div>
                          <h3 className="font-bold text-lg text-slate-800 mb-2">AI Analyzing Schema...</h3>
                          <p className="text-slate-500 text-sm mb-6">Mapping columns to internal data structures.</p>
                          
                          {/* Progress Bar */}
                          <div className="max-w-md mx-auto">
                             <div className="flex justify-between text-xs text-slate-500 mb-1">
                                <span>Processing</span>
                                <span>{analysisProgress}%</span>
                             </div>
                             <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                <div 
                                   className="h-full bg-blue-600 transition-all duration-300 ease-out rounded-full"
                                   style={{ width: `${analysisProgress}%` }}
                                ></div>
                             </div>
                          </div>
                       </div>
                    )}

                    {/* Mapping State */}
                    {importJob.status === 'mapping' && (
                       <div className="p-6 animate-in fade-in">
                          <div className="flex items-center gap-2 mb-4">
                             <Activity size={18} className="text-blue-600" />
                             <h3 className="font-bold text-slate-800">Review Field Mappings</h3>
                          </div>
                          <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
                             <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                                   <tr>
                                      <th className="p-3">Source Column</th>
                                      <th className="p-3 text-center"></th>
                                      <th className="p-3">Target Field</th>
                                      <th className="p-3">Confidence</th>
                                      <th className="p-3">Sample</th>
                                   </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                   {importJob.mappings.map((map, i) => (
                                      <tr key={i} className="hover:bg-slate-50">
                                         <td className="p-3 font-medium text-slate-700">{map.sourceField}</td>
                                         <td className="p-3 text-center text-slate-400"><ArrowRight size={16} /></td>
                                         <td className="p-3">
                                            <select 
                                               className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-sm focus:border-blue-500 outline-none"
                                               defaultValue={map.targetField}
                                            >
                                               <option value={map.targetField}>{map.targetField}</option>
                                               <option value="property_name">property_name</option>
                                               <option value="address">address</option>
                                               <option value="monthly_rent">monthly_rent</option>
                                               <option value="unmapped">-- Ignore --</option>
                                            </select>
                                         </td>
                                         <td className="p-3">
                                            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${getConfidenceColor(map.confidence)}`}>
                                               {map.confidence}%
                                            </span>
                                            {map.issue && (
                                                <div className="text-[10px] text-red-500 mt-1 flex items-center gap-1">
                                                    <AlertTriangle size={10} /> {map.issue}
                                                </div>
                                            )}
                                         </td>
                                         <td className="p-3 text-slate-500 italic text-xs truncate max-w-[150px]">{map.sampleValue}</td>
                                      </tr>
                                   ))}
                                </tbody>
                             </table>
                          </div>
                          <div className="flex justify-end gap-3">
                             <button onClick={resetUpload} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50">Cancel</button>
                             <button onClick={handleImport} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-200">
                                <Database size={18} /> Run Import
                             </button>
                          </div>
                       </div>
                    )}

                    {/* Completed State */}
                    {importJob.status === 'completed' && (
                       <div className="p-12 text-center animate-in fade-in">
                          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                             <CheckCircle2 size={32} />
                          </div>
                          <h3 className="font-bold text-2xl text-slate-800 mb-2">Import Successful</h3>
                          <p className="text-slate-500 mb-6">Successfully processed {importJob.mappings.length} columns and updated the database.</p>
                          <button onClick={resetUpload} className="px-6 py-2.5 bg-slate-900 text-white rounded-lg font-bold hover:bg-slate-800">
                             Upload Another File
                          </button>
                       </div>
                    )}
                 </div>
             )}
          </div>

          {/* Right Column: History / Status */}
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                   <RefreshCw size={18} className="text-slate-400" /> Recent Imports
                </h3>
                <div className="space-y-4">
                   <div className="flex items-start gap-3 pb-4 border-b border-slate-50">
                      <div className="w-8 h-8 bg-green-100 text-green-600 rounded flex items-center justify-center shrink-0">
                         <FileSpreadsheet size={16} />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-slate-700">Q3_Financials.xlsx</p>
                         <p className="text-xs text-slate-500">Oct 15 • 142 records</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-3 pb-4 border-b border-slate-50">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded flex items-center justify-center shrink-0">
                         <FileText size={16} />
                      </div>
                      <div>
                         <p className="text-sm font-bold text-slate-700">New_Leases_Batch.pdf</p>
                         <p className="text-xs text-slate-500">Oct 12 • 12 records</p>
                      </div>
                   </div>
                </div>
                <button className="w-full mt-4 text-xs font-bold text-blue-600 hover:underline">View All History</button>
             </div>

             <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                <h3 className="font-bold text-indigo-900 mb-2 flex items-center gap-2">
                   <Layout size={18} /> Schema Status
                </h3>
                <p className="text-xs text-indigo-700 mb-4 leading-relaxed">
                   Your internal data schema is healthy. AI mapping is currently operating at 94% average confidence.
                </p>
                <div className="w-full bg-white rounded-full h-1.5 mb-1">
                   <div className="bg-indigo-500 h-1.5 rounded-full" style={{width: '94%'}}></div>
                </div>
                <div className="text-right text-[10px] font-bold text-indigo-600">94% Accuracy</div>
             </div>
          </div>
       </div>
    </div>
  );
};

export default DataImporter;