const battleBackgroundImage = new Image()
battleBackgroundImage.src = './GameAssests/resizedBG.png'

const battleBackground = new Sprite({ 
    position: {
    x: 0,
    y: 0
    },
    image: battleBackgroundImage
})


let draggle
let ember
let renderedSprites

let battleAnimationID
let queue

function initBattle() {

    document.querySelector('#userInterface').style.display = 'block'
    document.querySelector('#dialogueBox').style.display = 'none'
    document.querySelector('#enemyHealthbar').style.width = '100%'
    document.querySelector('#playerHealthbar').style.width = '100%'
    document.querySelector('#attacksBox').replaceChildren()

    draggle = new Monster(monsters.Draggle)
    ember = new Monster(monsters.Ember)
    renderedSprites = [draggle, ember]
    queue = []

    ember.attacks.forEach(attack => {
        const button = document.createElement('button')
        button.innerHTML = attack.name
        document.querySelector('#attacksBox').append(button)
    })

    //determining which button you select for your attack
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', (e) => {

            const selectedAttack = attacks[e.currentTarget.innerHTML]

            ember.attack({ 
                attack: selectedAttack,
                recipient: draggle,
                renderedSprites
            })

            if(draggle.health <= 0)
            {
                queue.push(() => {
                    draggle.faint()
                })

                queue.push(() => {
                    //fade back to black
                    gsap.to('#overlappingDiv', {
                        opacity: 1,
                        onComplete: () => {
                            cancelAnimationFrame(battleAnimationID)
                            animate()
                            document.querySelector('#userInterface').style.display = 'none'

                            gsap.to('#overlappingDiv', {
                                opacity: 0
                            })

                            battle.initiated = false
                        }
                    })
                })
            }
            //enemy attacks right here
            const randomAttack = draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)]

            queue.push(() => {
                draggle.attack({ 
                    attack: randomAttack,
                    recipient: ember,
                    renderedSprites
                })

                if(ember.health <= 0)
                {
                    queue.push(() => {
                        ember.faint()
                    })

                    queue.push(() => {
                        //fade back to black
                        gsap.to('#overlappingDiv', {
                            opacity: 1,
                            onComplete: () => {
                                cancelAnimationFrame(battleAnimationID)
                                animate()
                                document.querySelector('#userInterface').style.display = 'none'
    
                                gsap.to('#overlappingDiv', {
                                    opacity: 0
                                })

                                battle.initiated = false
                            }
                        })
                    })

                }
            })
            
        })

        button.addEventListener('mouseenter', (e) => {
            const selectedAttack = attacks[e.currentTarget.innerHTML]
            document.querySelector('#attackType').innerHTML = selectedAttack.type
            document.querySelector('#attackType').style.color = selectedAttack.color

        })
    })
}

function animateBattle() {
    battleAnimationID = window.requestAnimationFrame(animateBattle)
    battleBackground.draw()
    console.log('animate battle')

    renderedSprites.forEach((sprite) => {
        sprite.draw()
    })
}

animate()
//initBattle()
//animateBattle()



document.querySelector('#dialogueBox').addEventListener('click', (e) => {

    if(queue.length > 0)
    {
        queue[0]()
        queue.shift()
    }
    else 
    {
        e.currentTarget.style.display = 'none'
    }
    console.log('clicked dialogue') 
})

