import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination

    if(!userId) {
        throw new ApiError(400, "userId is required")
    }

    const existedUser = await User.findById(userId)
    if(!existedUser) {
        throw new ApiError(404, "User not found")
    }

    const user=await User.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos"
            }
        }



    ])
    
    
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    // TODO: get video, upload to cloudinary, create video
    
    if([title, description].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Title and description are required")
    }


    if(!req.files?.videoFile || !req.files?.thumbnail) {
        throw new ApiError(400, "Video file and thumbnail are required")
    }

    let videoFileUrl;
    if(req.files&&Array.isArray(req.files.videoFile) && req.files.videoFile.length > 0) {
        videoFileUrl=req.files.videoFile[0].path
    }

    if(!videoFileUrl) {
        throw new ApiError(400, "Video file is required")
    }

    let thumbnailUrl;
    if(req.files&&Array.isArray(req.files.thumbnail) && req.files.thumbnail.length > 0) {
        thumbnailUrl=req.files.thumbnail[0].path
    }
    if(!thumbnailUrl) {
        throw new ApiError(400, "Thumbnail is required")
    }

    const videoFileUploadResult = await uploadOnCloudinary(videoFileUrl)

    const thumbnailUploadResult = await uploadOnCloudinary(thumbnailUrl)

    if(!videoFileUploadResult || !thumbnailUploadResult) {
        throw new ApiError(500, "Failed to upload video or thumbnail")
    }

    console.log("videoFileUploadResult", videoFileUploadResult)
    const video = await Video.create({
        title:title,
        description:description,
        videoFile: videoFileUploadResult.url,
        thumbnail: thumbnailUploadResult.url,
        owner: req.user._id,
        ispublished: true,
        duration:videoFileUploadResult.duration,
        views: 0
        
    })

    //console.log(req.files)

    return res
    .status(200)
    .json(new ApiResponse(200,video,"Video published successfully")) 

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
