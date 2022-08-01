const monsters = {
    Ember: {
        position: {
            x: 400,
            y: 475
        },
        image: {
            src: './GameAssests/embySprite.png',
        },
        frames: {
            max: 4,
            hold: 20
        },
        animate: true,
        name: "Agni",
        attacks: [attacks.Tackle, attacks.Fireball, attacks.Splash, attacks.FireBlast]
    },

    Draggle: {
        position: {
            x: 825,
            y: 300
        },
        image: {
            src: './GameAssests/draggleSprite.png',
        },
        frames: {
            max: 4,
            hold: 25
        },
        animate: true,
        isEnemy: true,
        name: "Ombu",
        attacks: [attacks.Tackle, attacks.Splash]
    }
}