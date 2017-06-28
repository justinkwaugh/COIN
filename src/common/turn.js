import ActionGroup from './actionGroup';
import _ from '../lib/lodash';

class Turn extends ActionGroup {

    constructor(state, definition) {
        definition.type = 'turn';
        super(definition);
        this.state = state;
        this.number = definition.number;
        this.commandAction = definition.commandAction;
        this.commands = [];
        this.specialAbilities = [];
        this.currentCommand = null;
        this.event = null;
        this.currentSpecialAbility = null;
    }

    startCommand(id) {
        this.currentCommand = new ActionGroup({
            type: 'command',
            id: id,
            factionId: this.factionId,
            actionStartIndex: this.state.actionHistory.currentIndex()
        });
    }

    commitCommand() {
        this.currentCommand.actionEndIndex = this.state.actionHistory.currentIndex();
        this.commands.push(this.currentCommand);
        this.currentCommand = null;
    }

    rollbackCommand() {
        // add undo of actions
        this.currentCommand = null;
    }

    startSpecialAbility(id) {
        this.currentSpecialAbility = new ActionGroup({
            type: 'command',
            id: id,
            factionId: this.factionId,
            actionStartIndex: this.state.actionHistory.currentIndex()
        });
    }

    commitSpecialAbility() {
        this.currentSpecialAbility.actionEndIndex = this.state.actionHistory.currentIndex();
        this.specialAbilities.push(this.currentSpecialAbility);
        this.currentSpecialAbility = null;
    }

    rollbackSpecialAbility() {
        // add undo of actions
        this.currentSpecialAbility = null;
    }

    startEvent(id) {
        this.event = new ActionGroup({
            type: 'event',
            id: id,
            factionId: this.factionId,
            actionStartIndex: this.state.actionHistory.currentIndex()
        });
    }

    commitEvent() {
        this.event.actionEndIndex = this.state.actionHistory.currentIndex();
    }

    rollbackEvent() {
        // add undo of actions
        this.event = null;
    }

    getInstructions(state) {
        if (this.actionEndIndex <= this.actionStartIndex) {
            return [];
        }

        const actionInstructions = _(
            state.actionHistory.getActionRange(this.actionStartIndex, this.actionEndIndex))
            .invokeMap('instructions', state).map(
                (instructions, index) => {
                    return _.map(instructions, (instruction) => {
                        return {
                            index: this.actionStartIndex + index,
                            type: 'action',
                            instruction
                        }
                    });
                }).flatten().value();

        _.each(this.specialAbilities, (sa) => {
            const insertIndex = _.findIndex(actionInstructions, actionInstruction => actionInstruction.index >= sa.actionStartIndex);
            actionInstructions.splice(insertIndex, 0,
                                      {index: sa.actionStartIndex, type: 'sa', instruction: this.factionId + ' chose to ' + sa.id});
        });

        _.each(this.commands, (command) => {
            const insertIndex = _.findIndex(actionInstructions, actionInstruction => actionInstruction.index >= command.actionStartIndex);
            actionInstructions.splice(insertIndex, 0,
                                      { index: command.actionStartIndex, type: 'command', instruction: this.factionId + ' chose to ' + command.id });
        });

        if(this.event) {
            const insertIndex = _.findIndex(actionInstructions, actionInstruction => actionInstruction.index >= this.event.actionStartIndex);
            actionInstructions.splice(insertIndex, 0,
                                      { index: event.actionStartIndex, type: 'event', instruction: this.factionId + ' chose to play Event' });
        }

        return actionInstructions;
    }

}

export default Turn;