const Community = require('../models/Community');
const { getCommunityById } = require('../config/constants');
const multer = require('multer');
const path = require('path');
const PDFDocument = require('pdfkit');
const fs = require('fs');

// Mendapatkan daftar semua komunitas
const getCommunities = async (req, res) => {
  try {
    const communities = await Community.find().populate('members', 'email');
    res.json(communities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mendapatkan detail komunitas berdasarkan ID
const getCommunityDetails = async (req, res) => { // Ubah nama di sini
  try {
    const community = await Community.findById(req.params.id).populate('members', 'email');
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }
    res.json(community);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Menambahkan lokasi ke komunitas
const addLocation = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(500).json({ message: 'Error uploading photo', error: err.message });
      }
      console.log('Uploaded file:', req.file);
      console.log('Body:', req.body);
      const { tanggal, lokasiJalan, mission, namaPantai } = req.body;
      const communityId = req.params.id;

      if (!tanggal || !lokasiJalan || !mission || !namaPantai || !req.file) {
        return res.status(400).json({ message: 'All fields are required, including photo' });
      }

      if (!getCommunityById(communityId)) {
        return res.status(400).json({ message: 'Invalid community ID' });
      }

      const community = await Community.findById(communityId);
      if (!community) {
        return res.status(404).json({ message: 'Community not found' });
      }

      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      const newLocation = {
        tanggal,
        lokasiJalan,
        mission,
        namaPantai,
        foto: req.file.path,
        addedBy: req.user,
      };

      console.log('New location:', newLocation);
      community.locations.push(newLocation);
      await community.save();

      res.status(201).json({
        message: 'Location added successfully',
        location: newLocation,
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const joinVolunteer = async (req, res) => {
  try {
    const { namaLengkap, namaPantai, tanggalKegiatan } = req.body;
    const communityId = req.params.id;

    if (!namaLengkap || !namaPantai || !tanggalKegiatan) {
      return res.status(400).json({ message: 'Nama lengkap, nama pantai, and tanggal kegiatan are required' });
    }

    if (!getCommunityById(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const volunteer = {
      namaLengkap,
      namaPantai,
      tanggalKegiatan,
      userId: req.user,
    };

    community.volunteers = community.volunteers || [];
    if (!community.volunteers.some(v => v.namaPantai === volunteer.namaPantai && v.tanggalKegiatan === volunteer.tanggalKegiatan)) {
      community.volunteers.push(volunteer);
      await community.save();
    }

    res.status(201).json({
      message: 'Joined as volunteer successfully',
      volunteer,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getVolunteers = async (req, res) => {
  try {
    const communityId = req.params.id;

    if (!getCommunityById(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }

    const community = await Community.findById(communityId).select('volunteers');
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    res.json({
      message: 'Volunteers retrieved successfully',
      volunteers: community.volunteers,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const selectCommunity = async (req, res) => {
  try {
    const communities = await Community.find();
    if (!communities.length) {
      return res.status(404).json({ message: 'No communities available' });
    }
    res.json({
      message: 'Please select a community',
      communities: communities.map(c => ({ id: c._id, name: c.name })),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const deleteLocation = async (req, res) => {
  try {
    const communityId = req.params.id;
    const locationId = req.params.locationId;

    if (!getCommunityById(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Cari dan hapus lokasi berdasarkan index atau filter
    const locationIndex = community.locations.findIndex(loc => 
      loc._id ? loc._id.toString() === locationId : false
    );
    if (locationIndex === -1) {
      return res.status(404).json({ message: 'Location not found' });
    }

    // Hapus lokasi dari array
    const deletedLocation = community.locations.splice(locationIndex, 1)[0];
    await community.save();

    res.json({
      message: 'Location deleted successfully',
      deletedLocation,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage }).single('foto');

const issueCertificate = async (req, res) => {
  try {
    const { namaLengkap, namaPantai, tanggalKegiatan } = req.body;
    const communityId = req.params.id;

    if (!namaLengkap || !namaPantai || !tanggalKegiatan) {
      return res.status(400).json({ message: 'Nama lengkap, nama pantai, and tanggal kegiatan are required' });
    }

    if (!getCommunityById(communityId)) {
      return res.status(400).json({ message: 'Invalid community ID' });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({ message: 'Community not found' });
    }

    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Cek apakah volunteer sudah terdaftar
    const volunteer = community.volunteers.find(v =>
      v.namaLengkap === namaLengkap &&
      v.namaPantai === namaPantai.toLowerCase() &&
      v.tanggalKegiatan === tanggalKegiatan.toLowerCase() &&
      v.userId.toString() === req.user.toString()
    );
    if (!volunteer) {
      return res.status(404).json({ message: 'Volunteer not found or not registered' });
    }

    // Generate nomor sertifikat unik
    const nomorSertifikat = `CERT-${Date.now()}-${req.user.toString().slice(-6)}`;

    // Buat PDF sertifikat
    const filePath = `certificates/${nomorSertifikat}.pdf`;
    const doc = new PDFDocument();
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    doc.fontSize(25).text('SERTIFIKAT PARTISIPASI', { align: 'center' });
    doc.moveDown();
    doc.fontSize(15).text(`Nomor Sertifikat: ${nomorSertifikat}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(18).text(`Diberikan kepada: ${namaLengkap}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(15).text(`Untuk partisipasi di ${namaPantai} pada ${tanggalKegiatan}`, { align: 'center' });
    doc.moveDown(2);
    doc.fontSize(12).text('Dikeluarkan oleh Ocean Cleanup Community', { align: 'center' });
    doc.end();

    writeStream.on('finish', () => {
      res.status(201).json({
        message: 'Certificate issued successfully',
        certificate: {
          nomorSertifikat,
          nama: namaLengkap,
          pageUrl: `http://localhost:5000/certificates/${nomorSertifikat}.pdf`, // Ubah ke URL halaman
        },
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getCommunities, getCommunityDetails, addLocation, selectCommunity, joinVolunteer, issueCertificate, getVolunteers, deleteLocation };