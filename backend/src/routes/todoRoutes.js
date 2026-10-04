const express = require('express');
const Todo = require('../models/Todo');
const router = express.Router();

router.get('/', async (_req,res,next)=>{try{res.json(await Todo.find().sort({createdAt:-1}));}catch(e){next(e);}});
router.post('/', async (req,res,next)=>{try{const title=(req.body.title||'').trim(); if(!title) return res.status(400).json({message:'Title is required'}); res.status(201).json(await Todo.create({title}));}catch(e){next(e);}});
router.patch('/:id', async (req,res,next)=>{try{const todo=await Todo.findByIdAndUpdate(req.params.id,{completed:Boolean(req.body.completed)}, {new:true,runValidators:true}); if(!todo) return res.status(404).json({message:'Todo not found'}); res.json(todo);}catch(e){next(e);}});
router.delete('/:id', async (req,res,next)=>{try{const todo=await Todo.findByIdAndDelete(req.params.id); if(!todo) return res.status(404).json({message:'Todo not found'}); res.json({message:'Todo deleted'});}catch(e){next(e);}});
module.exports = router;
