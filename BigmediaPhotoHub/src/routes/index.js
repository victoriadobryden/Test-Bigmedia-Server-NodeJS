const express = require('express')
const service = require('../services/photos')
const {asyncMW} = require('../utils/async')

const router = express.Router({strict: true})

router.get('/photo/:photoId', asyncMW(async (req, res) => {
  let {photoId} = req.params
  photoId = parseInt(photoId);
  const image = await service.image(photoId)
  if (!image) throw Error(404)
  res.writeHead(200, {'Content-Type': 'image/jpeg'})
  res.end(image, 'binary')
}))

router.get('/preview/:photoId', asyncMW(async (req, res) => {
  let {photoId} = req.params
  photoId = parseInt(photoId);
  const image = await service.image(photoId)
  if (!image) throw Error(404)
  console.warn(image)
  res.writeHead(200, {'Content-Type': 'image/jpeg'})
  res.end(image, 'binary')
}))

router.get('/face/:faceId', asyncMW(async (req, res) => {
  let {faceId} = req.params
  faceId = parseInt(faceId)
  // const image = await service.PresentByFaceId(faceId)
  // if (!image) throw Error(404)
  const image = await service.PresentByFaceId(faceId)
  console.warn(image);
  // res.writeHead(200, {'Content-Type': 'image/jpeg'})
  // res.end(image, 'binary')
}))
// router.get('/schema/:faceId', asyncMW(async (req, res) => {
//   const {faceId} = req.params
//   const image = await service.imageByFaceId(faceId)
//   if (!image) throw Error(404)
//   res.writeHead(200, {'Content-Type': 'image/jpeg'})
//   res.end(image, 'binary')
// }))


router.get('/getphoto/:sideId', asyncMW(async (req, res) => {
  let {sideId} = req.params
  sideId = parseInt(sideId)
  const image = await service.PresentBySideId(sideId)
}))

router.get('/schema/:faceId', asyncMW(async (req, res) => {
  let {faceId} = req.params
  faceId = parseInt(faceId)
  // console.warn('faceId->',faceId)
  const image = await service.GetSchemasByFaceId(faceId)
  
  if (!image) throw Error(404)
  res.writeHead(200, {'Content-Type': 'image/png'})
  res.end(image, 'binary')
}))
router.get('/getschema/:sideId', asyncMW(async (req, res) => {
  let {sideId} = req.params
  sideId = parseInt(sideId)
  const image = await service.GetSchemasBySideId(sideId)
  if (!image) throw Error(404)
  res.writeHead(200, {'Content-Type': 'image/png'})
  res.end(image, 'binary')
}))

router.get('/getposter/:IdPoster', asyncMW(async (req, res) => {
  let {IdPoster} = req.params
  IdPoster = parseInt(IdPoster)
  const poster = await service.GetPostersById(IdPoster)
  if (!poster) throw Error(404)
  res.writeHead(200, {'Content-Type': 'image/jpeg'})
  res.end(poster, 'binary')
}))

router.get('/getsubject/:subjectId', asyncMW(async (req, res) => {
  let {subjectId} = req.params
  subjectId = parseInt(subjectId)
  const poster = await service.GetSubjectById(subjectId)
  if (!poster) throw Error(404)
  res.writeHead(200, {'Content-Type': 'image/jpeg'})
  res.end(poster, 'binary')
}))

module.exports = router
