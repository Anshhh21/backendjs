import  {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist

    if(!name?.trim() || !description?.trim()) {
        throw new ApiError(400, "Playlist name/description is required")
    }

    const newPlaylist = await Playlist.create({
        name: name,
        description: description,
        createdBy: req.user._id,
        videos: []
    })

    if(!newPlaylist){
        throw new ApiError(500, "Error occured during creation of playlist")
    }

    return res .status(201).json(
        new ApiResponse(
            true,
            "Playlist created successfully",
            newPlaylist
        )
    )

})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists

    if (!userId?.trim()){
        throw new ApiError(400, "Give a userID")
    }

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid userID")
    }

    const playlists = await Playlist.find({createdBy: userId}).sort({createdAt: -1})

    if(!playlists || playlists.length === 0){
        throw new ApiError (404, "Error occured while extraction playlist of user or user dont have any playlist till")
    }

    return res.status(200).json(
        new ApiResponse(
            true,
            playlists,
            "User playlists fetched successfully"
        )

        
    )

    
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id

    if(!playlistId?.trim()){
        throw new ApiError(400, "Invalid PlaylistID")
    }

    const playlist = await Playlist.findById(playlistId).populate("videos")

    if(!playlist){
        throw new ApiError(404 ,"playlist not found")
    }

    return res.status(200).json(
        new ApiResponse(
            true,
            playlist,
            "playlist fetched properly"
        )
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId?.trim() || !videoId?.trim()){
        throw new ApiError(400, "Invalid PlaylistID or VideoID")
    }

    const playlist = await Playlist.findById(playlistId)
    if(!playlist){
        throw new ApiError(404, "playlist not found")
    }

    // Check if video already exists in the playlist

    if(playlist.videos.includes(videoId)){
        throw new ApiError(400, "Video already exists in the playlist")
    }

    playlist.videos.push(videoId)

    await playlist.save()

    return res.status(200).json(
        new ApiResponse(
            true,
            playlist,
            "Video added to playlist successfully"
        )
    )

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!playlistId?.trim() || !videoId?.trim()){
        throw new ApiError(400, "Invalid PlaylistID or VideoID")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(404, "playlist not found")
    }

    // Check if video exists in the playlist

    if(!playlist.videos.includes(videoId)){
        throw new ApiError(400, "Video does not exists in the playlist")
    }

    playlist.videos = playlist.videos.filter(
        (vid) => vid.toString() !== videoId
    )
    await playlist.save()

    return res.status(200).json(
        new ApiResponse(
            true,
            playlist,
            "Video removed from playlist successfully"
        )
    )

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    const userId = req.user._id

    if(!playlistId?.trim()){
        throw new ApiError(400,"playlistId is INVALID")
    }

    if (!isValidObjectId(playlistId)){
        throw new ApiError(400,"playlistId is INVALID")
    }

    if(playlistId.createdBy.toString() !== userId.toString()){
        throw new ApiError(400, "user not AUTHORISED")
    }

    const deletedPlaylist = await findByIdAndDelete(playlistId)

    if(!deletedPlaylist){
        throw new ApiError(400, "playlist not found")
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            deletedPlaylist,
            "playlist deleted successfully"
        )
    )
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist

    if(!playlistId?.trim() || !name?.trim() || !description?.trim()){
        throw new ApiError ( 400 , "deatils are not proper playlistID/name/description")
    }

    if (!isValidObjectId(playlistId)){
        throw new ApiError(400, "playlistId is not correct")
    }

    const updatedPlaylist = await findByIdAndUpdate(playlistId, {
        description: description,
        name: name
    },{new: true})

    if(!updatedPlaylist){
        throw new ApiError(404, "playlist not found or update failed")
    }

    return res.status(200).json(
        new ApiResponse(
            true,
            updatedPlaylist,
            "playlist updated successfully"
        )
    )

    
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}