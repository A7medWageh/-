"use client"

import { useState } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'

interface ImageUploaderProps {
  value: string[]
  onChange: (value: string[]) => void
}

export function ImageUploader({ value, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState<string | null>(null) // Holds the name of the file being uploaded

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    setUploading(file.name)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      // Handle non-JSON / empty response bodies gracefully
      const responseText = await response.text()
      let responseData: any = {}
      try {
        responseData = responseText ? JSON.parse(responseText) : {}
      } catch {
        // If parsing fails, keep raw response text for debugging.
        responseData = { error: responseText }
      }

      if (!response.ok) {
        const errorMessage =
          responseData?.details || responseData?.error || 'Upload failed'
        throw new Error(errorMessage)
      }

      const publicUrl = responseData?.publicUrl
      if (!publicUrl) {
        throw new Error('Upload succeeded but no public URL was returned')
      }

      onChange([...value, publicUrl])
    } catch (error: any) {
      console.error('Upload Error:', error)
      alert(`فشل رفع الصورة: ${error.message}`)
    } finally {
      setUploading(null)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.gif', '.webp'] },
    multiple: false,
  })

  const handleRemoveImage = (imageUrl: string) => {
    onChange(value.filter((url) => url !== imageUrl))
  }

  return (
    <div>
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/10'
            : 'border-muted-foreground/30 hover:border-primary hover:bg-primary/5'
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="font-medium">جاري رفع: {uploading}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="font-medium">اسحب وأفلت الصور هنا، أو اضغط للاختيار</span>
            <span className="text-sm text-muted-foreground">
              (PNG, JPG, WEBP, GIF)
            </span>
          </div>
        )}
      </div>

      {/* Image Previews */}
      {value.length > 0 && (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <div key={index} className="relative group aspect-square">
              <img
                src={url}
                alt={`صورة المنتج ${index + 1}`}
                className="h-full w-full rounded-lg object-cover border"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => handleRemoveImage(url)}
                className="absolute top-2 left-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
