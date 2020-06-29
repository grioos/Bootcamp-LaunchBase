const { age, date, graduation } = require('../../lib/utils')

const Teacher = require('../models/Teacher')

module.exports = {
    index(req, res) {
        let { filter, page, limit } = req.query

        page = page || 1
        limit = limit || 2
        let offset = limit * (page -1)

        const params = {
            filter,
            page,
            limit,
            offset,
            callback(teachers) {
                const pagination = {
                    total: Math.ceil(teachers.total / limit),
                    page
                }

                return res.render("teachers/index", { teachers, pagination, filter })
            }
        }

        Teacher.paginate(params)

    },
    create(req, res) {
        return res.render("teachers/create")
    },
    async post(req, res) {
        try {
            const keys = Object.keys(req.body)

            for(key of keys) {
               if(req.body[key] == "")  {
                   return res.send('Please, fill all fields')
               }
            }
    
            let { name, birth_date, education_level, class_type, subjects_taught, avatar_url } = req.body
    
            birth_date = date(birth_date).iso
            
            const teacher_id = await Teacher.create({
                name,
                birth_date, 
                education_level, 
                class_type, 
                subjects_taught,
                avatar_url
            })

            return res.redirect(`/teachers/${teacher_id}`)
        } catch (error) {
            console.error(error)
        }
    },
    async show(req, res) {
        try {
            const teacher = await Teacher.findOne({ where: { id: req.params.id } })

            if(!teacher) return res.send("Teacher not found!")
    
            teacher.age = age(teacher.birth_date)
            teacher.subjects_taught = teacher.subjects_taught.split(",")
            teacher.education_level = graduation(teacher.education_level)
            teacher.created_at = date(teacher.created_at).format
    
            return res.render("teachers/show", { teacher })
        } catch (error) {
            console.error(error)
        }
    },
    async edit(req, res) {
        try {
            const teacher = await Teacher.findOne({ where: { id: req.params.id } }) 

            if(!teacher) return res.send("Teacher not found!")
    
            teacher.birth_date = date(teacher.birth_date).iso
    
            return res.render("teachers/edit", { teacher })
        } catch (error) {
            console.error(error)
        }
    },
    async put(req, res) {
        try {
            const keys = Object.keys(req.body)

            for(key of keys) {
               if(req.body[key] == "")  {
                   return res.send('Please, fill all fields')
               }
            }
    
            req.body.birth_date = date(req.body.birth_date).iso
    
            await Teacher.update(req.body.id, {
                name: req.body.name,
                birth_date: req.body.birth_date,
                education_level: req.body.education_level,
                class_type: req.body.class_type,
                subjects_taught: req.body.subjects_taught,
                avatar_url: req.body.avatar_url
            })

            return res.redirect(`/teachers/${req.body.id}`)
        } catch (error) {
            console.error(error)
        }
    },
    async delete(req, res) {
        await Teacher.delete(req.body.id) 

        return res.redirect('/teachers')
    }
}