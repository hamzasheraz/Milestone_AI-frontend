import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Loader2, Upload, CheckCircle, FileAudio, Wand2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast"
import axios from 'axios'

export function EnhancedAudioUploadDashboardComponent() {
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadComplete, setUploadComplete] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [summary, setSummary] = useState("")
  const [images, setImages] = useState([]); // Update 2: Updated state initialization
  const { toast } = useToast()

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile && selectedFile.type.startsWith('audio/')) {
      setFile(selectedFile)
      toast({
        title: "File selected",
        description: `${selectedFile.name} is ready for upload.`,
        duration: 3000,
      })
    } else {
      setFile(null)
      toast({
        title: "Invalid file type",
        description: "Please select a valid audio file.",
        variant: "destructive",
        duration: 3000,
      })
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setUploadProgress(0)

    // Simulating file upload with progress
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 300))
      setUploadProgress(i)
    }

    setUploading(false)
    setUploadComplete(true)
    toast({
      title: "Upload complete",
      description: "Your audio file has been successfully uploaded.",
      duration: 3000,
    })
  }

  const generateSummary = async () => {
    setGenerating(true)
    setSummary("")
    setImages([])

    const formData = new FormData()
    formData.append("audio", file)

    try {
      const response = await axios.post("http://localhost:8000/create_summary/", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.status === 200) {
        const data = response.data
        const fullSummary = data.chunk_summaries.map((chunk) => chunk.summary).join(' ')
        const boldSummary = convertToBold(fullSummary)

        // Animate the summary text appearance
        for (let i = 0; i <= boldSummary.length; i++) {
          await new Promise(resolve => setTimeout(resolve, 30))
          setSummary(boldSummary.slice(0, i))
        }

        // Update 3: Updated image setting logic
        if (data.images && data.images.length > 0) {
          setImages([data.images[0]]);
        }
      } else {
        console.error(`HTTP error: ${response.status}`)
        setSummary("Error generating summary")
      }
    } catch (error) {
      console.error("Error:", error)
      setSummary("Error generating summary")
    }

    setGenerating(false)
  }

  const convertToBold = (text) => {
    return text.replace(/\*\*(.*?)\*\*/g, (match, p1) => {
      return ` <strong>${p1}</strong> `
    }).replace(/\s+/g, ' ').trim();
  }

  return (
    (<div
      className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl bg-white dark:bg-gray-800 shadow-2xl">
        <CardHeader
          className="text-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
          <CardTitle className="text-3xl font-bold">Audio Insights Dashboard</CardTitle>
          <CardDescription className="text-purple-100">Transform your meetings into actionable summaries and visuals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-purple-300 border-dashed rounded-lg cursor-pointer bg-purple-50 dark:bg-purple-900 hover:bg-purple-100 dark:hover:bg-purple-800 transition-all duration-300 group">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload
                  className="w-12 h-12 mb-3 text-purple-500 group-hover:text-purple-600 transition-colors duration-300" />
                <p className="mb-2 text-sm text-purple-700 dark:text-purple-300"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-purple-500 dark:text-purple-400">MP3, WAV, or M4A (MAX. 50MB)</p>
              </div>
              <Input
                id="dropzone-file"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="audio/*" />
            </label>
          </div>
          
          <AnimatePresence>
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center justify-between bg-purple-100 dark:bg-purple-800 p-4 rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileAudio className="w-6 h-6 text-purple-600 dark:text-purple-300" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-200">{file.name}</span>
                </div>
                <Button
                  onClick={handleUpload}
                  className="bg-purple-600 hover:bg-purple-700 text-white transition-colors duration-300"
                  disabled={uploading || uploadComplete}>
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Upload'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {uploading && (
            <div className="space-y-2">
              <Progress
                value={uploadProgress}
                className="w-full h-2 bg-purple-200 dark:bg-purple-700">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }} />
              </Progress>
              <p className="text-sm text-center text-purple-600 dark:text-purple-300">Uploading... {uploadProgress}%</p>
            </div>
          )}

          <AnimatePresence>
            {uploadComplete && !generating && !summary && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center space-y-4">
                <div
                  className="flex items-center justify-center space-x-2 text-green-500 dark:text-green-400">
                  <CheckCircle className="w-6 h-6" />
                  <span className="text-lg font-semibold">Upload complete!</span>
                </div>
                <Button
                  onClick={generateSummary}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white transition-all duration-300 transform hover:scale-105">
                  <Wand2 className="w-5 h-5 mr-2" />
                  Generate Summary and Visuals
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {generating && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center space-y-4">
                <div
                  className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-lg font-semibold text-purple-600 dark:text-purple-300">Generating insights...</p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {summary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md border border-purple-200 dark:border-purple-700">
                <h3
                  className="text-xl font-semibold text-purple-800 dark:text-purple-300 mb-4">Meeting Summary</h3>
                <div
                  className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6"
                  dangerouslySetInnerHTML={{ __html: summary }} />
                
                {/* Update 1: Replaced AnimatePresence block for images */}
                <AnimatePresence>
                  {images.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="mt-6">
                      <h4
                        className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-4">
                        Generated Visual
                      </h4>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group">
                        <img
                          src={`http://localhost:8000/static/plots/calmness_speaker_spk_0.png`}
                          alt="Generated visual"
                          className="w-full h-auto max-w-full object-contain rounded-lg shadow-lg" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>)
  );
}