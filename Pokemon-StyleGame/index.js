const canvas = document.querySelector('canvas')

const c = canvas.getContext('2d')

/*gsap.to('#overlappingDiv', {
    opacity: 1,
    rotation: 360,
    repeat: 3,
    scale: 2,
    yoyo: true,
    duration: 0.4
})*/


canvas.width = 1280
canvas.height = 720

const collisionsMap = []
for(let i = 0; i < collisions.length; i+= 100) {
    collisionsMap.push(collisions.slice(i, 100 + i))
}

const battleZonesMap = []
for(let i = 0; i < battleZonesData.length; i+= 100) {
    battleZonesMap.push(battleZonesData.slice(i, 100 + i))
}


const boundaries = []
//map orientation based on the starting frame
const offset = {
    x: -1205,
    y: -3200
}

collisionsMap.forEach((row, i) => {     //i is index of the row we are looping over
    row.forEach((symbol, j) => {        //within each row, j is the actual symbol
        if(symbol === 1025)
        boundaries.push(new Boundary({position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
        }
    })
    )
    })
})

const battleZones = []

battleZonesMap.forEach((row, i) => {     
    row.forEach((symbol, j) => {      
        if(symbol === 1025)
        battleZones.push(new Boundary({position: {
            x: j * Boundary.width + offset.x,
            y: i * Boundary.height + offset.y
        }
    })
    )
    })
})

console.log(battleZones)

//load images being used
const foregroundImage = new Image()
foregroundImage.src = './GameAssests/ForegroundObjs.png'

const image = new Image()
image.src = './GameAssests/ZoomMap.png'

const playerDownImage = new Image()
playerDownImage.src = './GameAssests/playerDown.png'

const playerUpImage = new Image()
playerUpImage.src = './GameAssests/playerUp.png'

const playerLeftImage = new Image()
playerLeftImage.src = './GameAssests/playerLeft.png'

const playerRightImage = new Image()
playerRightImage.src = './GameAssests/playerRight.png'

//creating background sprite with each direction frames
const player = new Sprite ({
    position: {
        x: canvas.width / 2 - (192 / 4) / 2,
        y: canvas.height / 2 - 68 / 2
    },
    image: playerDownImage,
    frames: {
        max: 4,
        hold: 10
    },
    sprites: {
        up: playerUpImage,
        left: playerLeftImage,
        right: playerRightImage,
        down: playerDownImage
    }
})

//creating background sprite
const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: image
})

//creating foreground sprite
const foreground = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: foregroundImage
})

//current key presses for moving 
const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },  
    d: {
        pressed: false
    },
    Shift: {
        pressed: false
    }   
}



const moveables = [background, ...boundaries, foreground, ...battleZones] //array that has all the moveables on the map


//collision detection code
function rectangularCollision({rectangle1, rectangle2}) {
    return(rectangle1.position.x + rectangle1.width >= rectangle2.position.x
        && rectangle1.position.x <= rectangle2.position.x + rectangle2.width
        && rectangle1.position.y <= rectangle2.position.y + rectangle2.height
        && rectangle1.position.y + rectangle1.height >= rectangle2.position.y)
}

const battle = {
    initiated: false
}

function animate() {
    const animationID = window.requestAnimationFrame(animate)   //the current frame we are in the loop
    background.draw()
    boundaries.forEach((boundary) => {
        boundary.draw()
    })

    battleZones.forEach((battleZone) => {
        battleZone.draw()
    })

    player.draw()
    foreground.draw()

    let moving = true
    player.animate = false

    if(battle.initiated) return 

    //activate a battle 
    if(keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed)
    {
         //battle zone collision check
         for(let i = 0; i < battleZones.length; i++)
         {
             const battleZone = battleZones[i]
             const overLappingArea = (Math.min(player.position.x + player.width, battleZone.position.x + battleZone.width) - Math.max(player.position.x, battleZone.position.x))
             * (Math.min(player.position.y + player.height, battleZone.position.y + battleZone.height) - Math.max(player.position.y, battleZone.position.y))
 
             if ( rectangularCollision({
                 rectangle1: player,
                 rectangle2: battleZone
             }) && overLappingArea > (player.width * player.height) / 2 && Math.random() < 0.01)    //determines the player area in half, checks for percentage of overlap 
             {
                 console.log('acivate battle')
                //deactivate previous animation
                window.cancelAnimationFrame(animationID)
                 battle.initiated = true
                 gsap.to('#overlappingDiv', {
                    opacity: 0.75,
                    rotation: 2160,
                    repeat: 1,
                    scale: 3,
                    yoyo: true,
                    ease: "power4.out",
                    duration: 1,
                    onComplete() {
                        gsap.to('#overlappingDiv', {
                            opacity: 1,
                            scale: 1,
                            duration: 0.4,
                            onComplete(){
                                
                                //active a new animation loop
                                initBattle()
                                animateBattle()
                                gsap.to('#overlappingDiv', {
                                    opacity: 0,
                                    duration: 0.4
                                })
                            }
                        })

                    }
                })
                 break
             }
 
             
         }
    }
    
    //moving the the player depending on the button press
    if(keys.w.pressed && lastKey === 'w') {
        player.animate = true
        player.image = player.sprites.up

        //boundary collision check
        for(let i = 0; i < boundaries.length; i++)
        {
            const boundary = boundaries[i]

            if ( rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: {
                    x: boundary.position.x,
                    y: boundary.position.y + 3
                }}   //creates a clone of the boundary object without overriding the original
            }))
            {
                moving = false
                break
            }

            
        } 
        
        if(moving)
        moveables.forEach((moveable) => {
            moveable.position.y += 3
        })
    }
    else if(keys.a.pressed && lastKey === 'a') { 
        player.animate = true
        player.image = player.sprites.left

        for(let i = 0; i < boundaries.length; i++)
        {
            const boundary = boundaries[i]

            if ( rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: {
                    x: boundary.position.x + 3,
                    y: boundary.position.y
                }} 
            }))
            {
                moving = false
                break
            }
        } if(moving)
        moveables.forEach((moveable) => {
            moveable.position.x += 3
        })
    }
    else if(keys.s.pressed && lastKey === 's') {
        player.animate = true
        player.image = player.sprites.down 

        for(let i = 0; i < boundaries.length; i++)
        {
            const boundary = boundaries[i]

            if ( rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: {
                    x: boundary.position.x,
                    y: boundary.position.y - 3
                }} 
            }))
            {
                moving = false
                break
            }
        } if(moving)
        moveables.forEach((moveable) => {
            moveable.position.y -= 3
        })
    }
    else if(keys.d.pressed && lastKey === 'd') {
        player.animate = true
        player.image = player.sprites.right

        for(let i = 0; i < boundaries.length; i++)
        {
            const boundary = boundaries[i]

            if ( rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: {
                    x: boundary.position.x - 3,
                    y: boundary.position.y
                }} 
            }))
            {
                moving = false
                break
            }
        } if(moving)
        moveables.forEach((moveable) => {
            moveable.position.x -= 3
        })
    }

    //hold shift to run
    if(keys.w.pressed && keys.Shift.pressed && lastKey === 'w') {
        player.animate = true
        player.image = player.sprites.up

        for(let i = 0; i < boundaries.length; i++)
        {
            const boundary = boundaries[i]

            if ( rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: {
                    x: boundary.position.x,
                    y: boundary.position.y + 4
                }} 
            }))
            {
                moving = false
                break
            }
        } if(moving)
        moveables.forEach((moveable) => {
            moveable.position.y += 4
        })
    }
    else if(keys.a.pressed && keys.Shift.pressed && lastKey === 'a') {
        player.animate = true
        player.image = player.sprites.left 

        for(let i = 0; i < boundaries.length; i++)
        {
            const boundary = boundaries[i]

            if ( rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: {
                    x: boundary.position.x + 4,
                    y: boundary.position.y
                }} 
            }))
            {
                moving = false
                break
            }
        } if(moving)
        moveables.forEach((moveable) => {
            moveable.position.x += 4
        })
    }
    else if(keys.s.pressed && keys.Shift.pressed && lastKey === 's') {
        player.animate = true
        player.image = player.sprites.down 

        for(let i = 0; i < boundaries.length; i++)
        {
            const boundary = boundaries[i]

            if ( rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: {
                    x: boundary.position.x,
                    y: boundary.position.y - 4
                }}  
            }))
            {
                moving = false
                break
            }
        } if(moving)
        moveables.forEach((moveable) => {
            moveable.position.y -= 4
        })
    }
    else if(keys.d.pressed && keys.Shift.pressed && lastKey === 'd') {
        player.animate = true
        player.image = player.sprites.right 

        for(let i = 0; i < boundaries.length; i++)
        {
            const boundary = boundaries[i]

            if ( rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: {
                    x: boundary.position.x - 4,
                    y: boundary.position.y
                }} 
            }))
            {
                moving = false
                break
            }
        } if(moving)
        moveables.forEach((moveable) => {
            moveable.position.x -= 4
        })
    }


}

//animate()

let lastKey = ''
window.addEventListener('keydown', (e) => {

    switch (e.key) {
        case 'w':
            keys.w.pressed = true
            lastKey = 'w'
        break

        case 'a':
            keys.a.pressed = true
            lastKey = 'a'
        break

        case 's':                       
            keys.s.pressed = true
            lastKey = 's'
        break

        case 'd':
            keys.d.pressed = true
            lastKey = 'd'
        break

        case 'Shift':
            keys.Shift.pressed = true
            //lastKey = 'Shift'
        break
    }


})

window.addEventListener('keyup', (e) => {

    switch (e.key) {
        case 'w':
            keys.w.pressed = false
        break

        case 'a':
            keys.a.pressed = false
        break

        case 's':
            keys.s.pressed = false
        break

        case 'd':
            keys.d.pressed = false
        break

        case 'Shift':
            keys.Shift.pressed = false
        break
    }


})