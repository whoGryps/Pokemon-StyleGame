class Sprite {
    constructor({
        position, image, frames = { max: 1, hold: 10 }, sprites, animate = false, rotation = 0}) 
        {
            this.position = position
            this.image = new Image()
            this.frames = {...frames, val: 0, elapsed: 0}

            this.image.onload = () => {
                this.width = this.image.width / this.frames.max
                this.height = this.image.height
            }

            this.image.src = image.src

        this.animate = animate
        this.sprites = sprites
        this.opacity = 1

        this.rotation = rotation
    }

    draw() {
        c.save()    //save and restore are required for a global canvas property

        c.translate(this.position.x + this.width / 2, this.position.y + this.height / 2)
        c.rotate(this.rotation)
        c.translate(-this.position.x - this.width / 2, -this.position.y - this.height / 2)

        c.globalAlpha = this.opacity

        c.drawImage
        (this.image,
        
        //cropping    
        this.frames.val * this.width,
        0,
        this.image.width / this.frames.max,
        this.image.height,
            
        //actual coordinates of the image
        this.position.x,
        this.position.y,
        this.image.width / this.frames.max,
        this.image.height,

        )

        c.restore()
        
        if(!this.animate) return

            if(this.frames.max > 1){
                this.frames.elapsed++
            }
            
            if(this.frames.elapsed % this.frames.hold === 0) {
                if(this.frames.val < this.frames.max - 1)
                this.frames.val++
                else this.frames.val = 0
            }
    }

    
}

class Monster extends Sprite {

    constructor({position, image, frames = { max: 1, hold: 10 }, sprites, animate = false, rotation = 0, isEnemy = false, name, attacks}) 
    {
        super({
            position, image, frames, sprites, animate, rotation
        })
        this.health = 100

        this.isEnemy = isEnemy
        this.name = name
        this.attacks = attacks
    }

    faint() {
        document.querySelector('#dialogueBox').innerHTML = this.name + ' fainted!'

        gsap.to(this.position, {
            y: this.position.y + 20

        })

        gsap.to(this, {
            opacity: 0
        })
    }


    attack({attack, recipient, renderedSprites}) {

        document.querySelector('#dialogueBox').style.display = 'block'
        document.querySelector('#dialogueBox').innerHTML = this.name + ' used ' + attack.name

        let healthBar = '#enemyHealthBar'
        if(this.isEnemy) healthBar = '#playerHealthBar'

        recipient.health -= attack.damage   //updates health over time

        let rotation = 1
        if(this.isEnemy) rotation = -2.2

        switch(attack.name) {
            case 'Fireball': 
                const fireBallImg = new Image()
                fireBallImg.src = './GameAssests/fireball.png'
                const fireball = new Sprite({
                    position: {
                        x: this.position.x,
                        y: this.position.y,
                    },
                    image: fireBallImg,
                    frames: {
                                max: 4,
                                hold: 10
                    },
                    animate: true,
                    rotation
                })
                
                renderedSprites.splice(1, 0, fireball) //spawning the fireball infront of monster

                gsap.to(fireball.position, {
                    x: recipient.position.x,
                    y: recipient.position.y,

                    onComplete: () => {


                        //enemy gets hit
                        gsap.to(healthBar, {
                            width: recipient.health + '%'
                        })
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })

                        gsap.to(recipient, {
                            opacity: 0,
                            repeat: 5,
                            yoyo: true,
                            duration: 0.08
                        })
                        renderedSprites.splice(1, 1)
                    }
                })
            break
            case 'Tackle':
                const tl = gsap.timeline()

                let movementDistance = 40
                if(this.isEnemy) movementDistance = -40

                tl.to(this.position, {
                    x: this.position.x - movementDistance
                }).to(this.position, {
                    x: this.position.x + movementDistance * 2,
                    duration: 0.1,
                    onComplete: () => {
                        //enemy gets hit
                        gsap.to(healthBar, {
                            width: recipient.health + '%'
                        })
                        gsap.to(recipient.position, {
                            x: recipient.position.x + 10,
                            yoyo: true,
                            repeat: 5,
                            duration: 0.08
                        })

                        gsap.to(recipient, {
                            opacity: 0,
                            repeat: 5,
                            yoyo: true,
                            duration: 0.08
                        })
                    }
                }).to(this.position, {
                    x: this.position.x
                })
            break
            
            case 'FireBlast':

                const hitPercent = Math.random()

                let dodgeDist = 110
                if(this.isEnemy) dodgeDist = -110

                if(hitPercent < 0.5)
                {
                    //this.health -= attack.damage   //updates health over time
                    console.log('FirebBlast Hit')

                    gsap.to(healthBar, {
                        width: recipient.health + '%'
                    })
                    gsap.to(recipient.position, {
                        x: recipient.position.x + 10,
                        yoyo: true,
                        repeat: 5,
                        duration: 0.08
                    })

                    gsap.to(recipient, {
                        opacity: 0,
                        repeat: 5,
                        yoyo: true,
                        duration: 0.08
                })
                } else {

                    const tl2 = gsap.timeline()

                    console.log('FireBlast Miss')

                    tl2.to(recipient.position, {
                        x: recipient.position.x - dodgeDist,
                        duration: 0.3
                    }).to(recipient.position, {
                        x: recipient.position.x + dodgeDist * 2,
                        duration: 0.3,
                    }).to(recipient.position, {
                        x: recipient.position.x

                    })

                }
            break 

            case 'Splash':
                const timeLine = gsap.timeline()

                let moveDistance = 40
                if(this.isEnemy) moveDistance = -40

                timeLine.to(this.position, {
                    x: this.position.x - moveDistance
                }).to(this.position, {
                    x: this.position.x + moveDistance * 2,
                    duration: 0.3,
                    yoyo: true,
                    repeat: 2
                }).to(this.position, {
                    x: this.position.x
                })
            break
            
        }
    }

}
class Boundary {
    static width = 66
    static height = 66
    constructor ({position}) {
        this.position = position
        this.width = 66     //pixels are 12x12, we zoomed in at 550% so multiplied by 5.5
        this.height = 66
    }

    draw() {
        c.fillStyle = 'rgba(255, 0, 0, 0)'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}