const {PhotoImage, PhotosPresent,Posters} = require('../models')

// const load = (id) => Photo.findOne({
//   where: { id },
//   attributes: { exclude: ['subject'] }
// })

const image = async (photoId) => {
  const object = await PhotoImage.findOne({
    where: { photoId },
    attributes: ['photo']
  })
  return object && object.photo
}

const imageByFaceId = async (faceId) => {
  const object = await PhotoImage.findOne({
    where: { faceId },
    attributes: ['photo']
  })
  return object && object.photo
}

const PresentByFaceId = async (faceId) => {
  const object = await PhotosPresent.findOne({
    where: { faceId },
    attributes: ['id_side','path','city','address','cathegory','supplier_sn','sizetype','sidetype']
  })
  return object
}
const PresentBySideId = async (sideId) => {
  const object = await PhotosPresent.findOne({
    where: { sideId },
    attributes: ['id_side','path','city','address','cathegory','supplier_sn','sizetype','sidetype']
  })
  return object
}
const GetSchemasBySideId = async (sideId) => {
  const object = await PhotosPresent.findOne({
    where: { sideId },
    attributes: ['schem']
  })
  return object && object.schem
}
const GetSchemasByFaceId = async (faceId) => {
  const object = await PhotosPresent.findOne({
    where: { faceId },
    attributes: ['schem']
  })
  return object && object.schem
}
const GetPostersById = async (IdPoster) => {
  const object = await Posters.findOne({
    where: { IdPoster },
    attributes: ['poster']
  })
  return object && object.poster
}

const GetSubjectById = async (subjectId) => {
  const object = await Posters.findOne({
    where: { subjectId },
    attributes: ['poster']
  })
  return object && object.poster
}
module.exports = {
  // load,
  image,
  imageByFaceId,
  PresentByFaceId,
  PresentBySideId,
  GetSchemasBySideId,
  GetSchemasByFaceId,
  GetPostersById,
  GetSubjectById
}
