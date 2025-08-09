const express = require('express');
const path = require('path');
const fs = require('fs-extra');
const { prisma } = require('../database/connection');

const router = express.Router();

/**
 * OPTIONS /api/audio/:salesCallId
 * Handle preflight requests for CORS
 */
router.options('/:salesCallId', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
    'Access-Control-Allow-Headers': 'Range, Content-Type',
    'Access-Control-Max-Age': '86400' // Cache preflight for 24 hours
  });
  res.status(200).end();
});

/**
 * GET /api/audio/:salesCallId
 * Serve audio file for a specific sales call
 */
router.get('/:salesCallId', async (req, res) => {
  try {
    const { salesCallId } = req.params;
    
    console.log(`🎧 Audio request for sales call ID: ${salesCallId}`);
    
    // Validate salesCallId parameter
    if (!salesCallId || !Number.isInteger(parseInt(salesCallId))) {
      return res.status(400).json({ 
        error: 'Invalid sales call ID format' 
      });
    }
    
    // Get the audio file path from database
    const salesCall = await prisma.salesCall.findUnique({
      where: { id: parseInt(salesCallId) },
      select: { audioFilePath: true }
    });
    
    if (!salesCall || !salesCall.audioFilePath) {
      console.log(`❌ Audio file not found for sales call ID: ${salesCallId}`);
      return res.status(404).json({ 
        error: 'Audio file not found for this sales call' 
      });
    }
    
    // Check if file exists on filesystem
    const fileExists = await fs.pathExists(salesCall.audioFilePath);
    if (!fileExists) {
      console.log(`❌ Audio file missing from filesystem: ${salesCall.audioFilePath}`);
      return res.status(404).json({ 
        error: 'Audio file not available' 
      });
    }
    
    // Get file stats for proper headers
    const stats = await fs.stat(salesCall.audioFilePath);
    const fileName = path.basename(salesCall.audioFilePath);
    
    console.log(`✅ Serving audio file: ${fileName} (${stats.size} bytes)`);
    
    // Set proper headers for audio streaming
    res.set({
      'Content-Type': getAudioMimeType(fileName),
      'Content-Length': stats.size,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Range, Content-Type',
      'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges'
    });
    
    // Handle range requests for seeking
    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunksize = (end - start) + 1;
      
      res.status(206);
      res.set({
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Content-Length': chunksize,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges'
      });
      
      const stream = fs.createReadStream(salesCall.audioFilePath, { start, end });
      stream.pipe(res);
    } else {
      // Serve full file
      const stream = fs.createReadStream(salesCall.audioFilePath);
      stream.pipe(res);
    }
    
  } catch (error) {
    console.error('❌ Audio serving error:', error);
    res.status(500).json({ 
      error: 'Internal server error while serving audio' 
    });
  }
});

/**
 * Helper function to get MIME type from filename
 */
function getAudioMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.m4a': 'audio/mp4',
    '.aac': 'audio/aac',
    '.ogg': 'audio/ogg'
  };
  return mimeTypes[ext] || 'audio/mpeg';
}

module.exports = router;
