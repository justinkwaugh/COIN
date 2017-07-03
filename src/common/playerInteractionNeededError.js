class PlayerInteractionNeededError {
    constructor(message, interaction) {
        this.name = 'PlayerInteractionNeededError';
        this.message = message;
        this.interaction = interaction;
    }
}

export default PlayerInteractionNeededError;