'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function ImportTimesheetsPage() {
  const router = useRouter()
  const [file, setFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = (selectedFile) => {
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile)
      setImportResult(null)
    } else {
      toast.error('Please select a valid CSV file')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    handleFileSelect(droppedFile)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/timesheets/import', {
        method: 'GET',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error('Failed to download template')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'timesheet_template.csv'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      toast.success('Template downloaded successfully')
    } catch (error) {
      console.error('Error downloading template:', error)
      toast.error('Failed to download template')
    }
  }

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a CSV file to import')
      return
    }

    try {
      setImporting(true)
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/timesheets/import', {
        method: 'POST',
        body: formData,
        credentials: 'include'
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Import failed')
      }

      setImportResult(result.results)
      toast.success(result.message)

      if (result.results.imported > 0) {
        setTimeout(() => {
          router.push('/team_member/dashboard/timesheets')
        }, 3000)
      }

    } catch (error) {
      console.error('Error importing CSV:', error)
      toast.error(error.message || 'Failed to import CSV')
    } finally {
      setImporting(false)
    }
  }

  const resetImport = () => {
    setFile(null)
    setImportResult(null)
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="mb-4" asChild>
            <Link href="/team_member/dashboard/timesheets">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Timesheets
            </Link>
          </Button>
          <h1 className="text-3xl font-bold mb-2">Import Timesheets</h1>
          <p className="text-muted-foreground">Upload a CSV file to bulk import your timesheet entries</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Import Section */}
          <div className="lg:col-span-2">
            <div className="bg-card border rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Upload CSV File</h2>
                <Button variant="outline" size="sm" onClick={downloadTemplate}>
                  <Download className="w-4 h-4 mr-2" />
                  Download Template
                </Button>
              </div>

              {/* File Upload Area */}
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {file ? (
                  <div className="space-y-4">
                    <FileSpreadsheet className="w-12 h-12 mx-auto text-green-500" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={resetImport}>
                      Choose Different File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                    <div>
                      <p className="text-lg font-medium">Drop your CSV file here</p>
                      <p className="text-muted-foreground">or click to browse</p>
                    </div>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={(e) => handleFileSelect(e.target.files[0])}
                      className="hidden"
                      id="csv-upload"
                    />
                    <label htmlFor="csv-upload">
                      <Button variant="outline" className="cursor-pointer">
                        Choose File
                      </Button>
                    </label>
                  </div>
                )}
              </div>

              {/* Import Button */}
              {file && !importResult && (
                <Button onClick={handleImport} disabled={importing} className="w-full">
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Import Timesheets
                    </>
                  )}
                </Button>
              )}

              {/* Import Results */}
              {importResult && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Import Results</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-center">
                      <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                      <p className="text-2xl font-bold text-green-600">{importResult.imported}</p>
                      <p className="text-sm text-green-700 dark:text-green-300">Imported</p>
                    </div>
                    
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
                      <XCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
                      <p className="text-2xl font-bold text-red-600">{importResult.errors.length}</p>
                      <p className="text-sm text-red-700 dark:text-red-300">Errors</p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-4 text-center">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-600" />
                      <p className="text-2xl font-bold text-gray-600">{importResult.skipped}</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">Skipped</p>
                    </div>
                  </div>

                  {importResult.errors.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Errors Found:</h4>
                      <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 max-h-48 overflow-y-auto">
                        {importResult.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-4">
                    <Button onClick={resetImport} variant="outline">
                      Import Another File
                    </Button>
                    {importResult.imported > 0 && (
                      <Button asChild>
                        <Link href="/team_member/dashboard/timesheets">
                          View Timesheets
                        </Link>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions Sidebar */}
          <div className="space-y-6">
            <div className="bg-card border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4">CSV Format Requirements</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Required Columns:</p>
                  <ul className="text-muted-foreground mt-1 space-y-1">
                    <li>• project_name</li>
                    <li>• task_title</li>
                    <li>• work_date (YYYY-MM-DD)</li>
                    <li>• hours (decimal)</li>
                    <li>• is_billable (true/false)</li>
                    <li>• description</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium">Notes:</p>
                  <ul className="text-muted-foreground mt-1 space-y-1">
                    <li>• Maximum 24 hours per entry</li>
                    <li>• Project must exist and be accessible</li>
                    <li>• Task must exist in the project</li>
                    <li>• No duplicate entries for same date/task</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-blue-800 dark:text-blue-200">Pro Tip</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Download the template first to see the exact format and example data.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}