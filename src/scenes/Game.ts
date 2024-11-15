import { Scene, Utils } from 'phaser';


export class Game extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    msg_text: Phaser.GameObjects.Text;
    components: any[] = [
        'cpu',
        'motherboard',
        'ram',
        'hdd',
        'gpu'
    ]
    isDragging: boolean = false
    draggedSprite: any = null
    sprites: any[] = []
    offSetX: number = 0
    offSetY: number = 0
    text_select: Phaser.GameObjects.Text;
    text_question: Phaser.GameObjects.Text;
    acertijos: any[] = [
        {
            accert: 'Soy el cerebro de la computadora,\n sin mí no hay lógica ni procesamiento. ¿Quién soy?',
            value: 'cpu'
        },
        {
            accert: 'Soy la que conecta todos los componentes,\n sin mí, todo estaría desconectado. ¿Quién soy?',
            value: 'motherboard'
        },
        {
            accert: 'Trabajo en la sombra, guardo los datos que usas actualmente,\n pero me olvidas cuando apagas la computadora. ¿Quién soy?',
            value: 'ram'
        },
        {
            accert: 'Soy el guardián de tus archivos y programas,\n pero me pongo lento cuando tienes mucha carga. ¿Quién soy?',
            value: 'hdd'
        },
        {
            accert: 'Trabajo con píxeles,\n soy responsable de las imágenes y videos,\n y sin mí, la pantalla sería solo un parpadeo. ¿Quién soy?',
            value: 'gpu'
        }
    ]
    next: number = 0

    constructor() {
        super('Game');
    }

    showQuestion() {
        const key = this.acertijos[this.next]
        this.text_question.setText(`${key!.accert}`)
        return key
    }

    loadComponent(name: string, x: number, y: number) {
        const component = this.add.sprite(x, y, name)
            .setOrigin(0)
            .setInteractive()
            .setDisplaySize(140, 140)
        return component
    }

    randomQuestion() {
        Utils.Array.Shuffle(this.acertijos)
    }
    nextQuestion() {
        this.next++

        if (this.next < this.acertijos.length) {
            this.showQuestion()
        } else {
            this.draggedSprite = null
            this.isDragging = false
            this.next = 0;
            this.text_question.setText('Felicidades conoces todos los componentes principales del computador')
            this.text_question.setColor('#ffe101')
            this.time.delayedCall(2000, () => this.scene.start('MainMenu'), [], this)
        }
    }

    generateSprites() {
        for (let i = 0; i < this.components.length; i++) {
            const randomX = Phaser.Math.Between(50, 800)
            const randomY = Phaser.Math.Between(50, 500)
            let sprite = this.loadComponent(this.components[i], randomX, randomY)
            sprite.setName(this.components[i])
            this.sprites.push(sprite)
        }
    }
    create() {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(394762);
        this.text_select = this.add.text(0, 0, 'Componente: ', {
            fontFamily: 'Arial black',
            fontSize: '30px'
        }).setOrigin(0)
        this.text_question = this.add.text(512, 100, 'Selecciona y arrastra el componente correcto', {
            fontFamily: 'Arial black',
            fontSize: '25px',
            color: '#0065ff'
        }).setOrigin(0.5)
        const pcSprite = this.physics.add.sprite(512, 700, 'pc')
        .setDisplaySize(150, 150)
        .setInteractive()
        
        this.generateSprites()
        this.randomQuestion()
        this.showQuestion()
        this.sprites.forEach(sprite => {
            // Evento cuando presionas sobre el sprite
            sprite.on('pointerdown', (pointer: any) => {
                const k = this.showQuestion()
                this.isDragging = true;
                this.draggedSprite = sprite;
                let spritePhysics = this.physics.add.existing(sprite)
                this.physics.add.collider(pcSprite, spritePhysics, () => {
                    if (k.value === sprite.name) {
                        this.text_select.setText(`Componente: Correcto`)
                        this.nextQuestion()
                        sprite.destroy()
                    } else {
                        console.log(sprite.name, k.value)
                        return this.text_select.setText(`Componente: Incorrecto`)
                    }
                })

                this.offSetX = pointer.x - sprite.x
                this.offSetY = pointer.y - sprite.y
            });

            // Evento cuando sueltas el sprite
            sprite.on('pointerup', () => {
                this.isDragging = false;
                this.draggedSprite = null;  // Dejamos de arrastrar
                this.text_select.setText(`Componente:`)

            });

            // Evento cuando el puntero sale del sprite sin soltar
            sprite.on('pointerout', () => {
                this.isDragging = false;
                this.draggedSprite = null;  // Dejamos de arrastrar
            });
        })
    }
    update() {
        if (this.isDragging && this.draggedSprite) {
            this.draggedSprite.x = this.input.x - this.offSetX;
            this.draggedSprite.y = this.input.y - this.offSetY;
        }
    }
}
