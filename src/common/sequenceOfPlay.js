import _ from '../lib/lodash.js';
import ko from '../lib/knockout.js';
import FactionActions from './factionActions';
import SequenceForCard from './sequenceForCard';

class SequenceOfPlay {
    constructor(state, definition) {
        const that = this;

        this.history = ko.observableArray([]);
        this.eligibleFactions = ko.observableArray(definition.factions);
        this.ineligibleFactions = ko.observableArray();
        this.passedFactions = ko.observableArray();
        this.forcedEligibleFactionIds = ko.observableArray();
        this.forcedIneligibleFactionIds = ko.observableArray();
        this.currentSequenceForCard = ko.observable(new SequenceForCard({ eligible: _.clone(this.eligibleFactions())}));
        this.state = state;

        this.firstFaction = ko.observable();
        this.secondFaction = ko.observable();

        this.firstActionChosen = ko.observable();
        this.secondActionChosen = ko.observable();

        this.availableActions = ko.pureComputed(() => {
            const availableActions = [];
            if (!this.firstActionChosen()) {
                availableActions.push.apply(availableActions,
                                            [FactionActions.EVENT, FactionActions.COMMAND, FactionActions.COMMAND_AND_SPECIAL]);
            }
            else if (this.firstActionChosen() === FactionActions.COMMAND_AND_SPECIAL) {
                availableActions.push(FactionActions.EVENT);
                if (true) { // check player
                    availableActions.push(FactionActions.COMMAND_AND_SPECIAL);
                }
                else {
                    availableActions.push(FactionActions.LIMITED_COMMAND);
                }
            }
            else if (this.firstActionChosen() === FactionActions.COMMAND) {
                if (true) { // check player
                    availableActions.push(FactionActions.COMMAND_AND_SPECIAL);
                }
                else {
                    availableActions.push(FactionActions.LIMITED_COMMAND);
                }
            }
            else if (this.firstActionChosen() === FactionActions.EVENT) {
                availableActions.push(FactionActions.COMMAND_AND_SPECIAL);
            }
            return availableActions;
        });
    }

    toJSON() {
        return {
            history: this.history(),
            eligibleFactions: this.eligibleFactions(),
            ineligibleFactions: this.ineligibleFactions(),
            passedFactions: this.passedFactions(),
            forcedEligibleFactionIds: this.forcedEligibleFactionIds(),
            forcedIneligibleFactionIds: this.forcedIneligibleFactionIds(),
            currentSequenceForCard: this.currentSequenceForCard(),
            firstFaction: this.firstFaction(),
            secondFaction: this.secondFaction(),
            firstActionChosen: this.firstActionChosen(),
            secondActionChosen: this.secondActionChosen()
        };
    }

    loadGameState(json) {
        const self = this;

        json.history.forEach((value) => {
            self.history.push(new SequenceForCard(value));
        });
        self.eligibleFactions(json.eligibleFactions);
        self.ineligibleFactions(json.ineligibleFactions);
        self.passedFactions(json.passedFactions);
        self.forcedEligibleFactionIds(json.forcedEligibleFactionIds);
        self.forcedIneligibleFactionIds(json.forcedIneligibleFactionIds);
        const currentSequenceForCard = new SequenceForCard(json.currentSequenceForCard);
        currentSequenceForCard.loadGameState(json.currentSequenceForCard);
        self.currentSequenceForCard(currentSequenceForCard);
        self.firstFaction(json.firstFaction);
        self.secondFaction(json.secondFaction);
        self.firstActionChosen(json.firstActionChosen);
        self.secondActionChosen(json.secondActionChosen);
    }

    updateEligibility() {

        _.each(this.passedFactions(), (factionId) => {
            this.eligibleFactions.push(factionId);
        });
        this.passedFactions([]);
        _.each(this.ineligibleFactions(), (factionId) => {
            if(_.indexOf(this.forcedIneligibleFactionIds(), factionId) < 0) {
                this.eligibleFactions.push(factionId);
            }
        });

        const newlyIneligible = [];
        if (this.firstFaction()) {
            if (_.indexOf(this.forcedEligibleFactionIds(), this.firstFaction()) >= 0) {
                this.eligibleFactions.push(this.firstFaction());
            }
            else {
                newlyIneligible.push(this.firstFaction());
            }
        }
        if (this.secondFaction()) {
            if (_.indexOf(this.forcedEligibleFactionIds(), this.secondFaction()) >= 0) {
                this.eligibleFactions.push(this.secondFaction());
            }
            else {
                newlyIneligible.push(this.secondFaction());
            }
        }
        this.ineligibleFactions(_.union(newlyIneligible, this.forcedIneligibleFactionIds()));
        this.history.push(this.currentSequenceForCard());
        this.currentSequenceForCard(new SequenceForCard({
            eligible: _.clone(this.eligibleFactions()),
            ineligible: _.clone(this.ineligibleFactions())
        }));

        this.firstFaction(null);
        this.secondFaction(null);
        this.firstActionChosen(null);
        this.secondActionChosen(null);
        this.forcedEligibleFactionIds([]);
        this.forcedIneligibleFactionIds([]);
    }

    resetEligibility() {
        this.eligibleFactions.push.apply(this.eligibleFactions, this.ineligibleFactions());
        this.ineligibleFactions([]);
        this.history.push(this.currentSequenceForCard());
        this.currentSequenceForCard(new SequenceForCard({
            eligible: _.clone(this.eligibleFactions()),
            ineligible: _.clone(this.ineligibleFactions())
        }));
    }

    recordFactionAction(factionId, action) {
        console.log('Faction ' + factionId + ' did action ' + action);
        this.eligibleFactions.remove(factionId);
        if (action === FactionActions.PASS) {
            this.passedFactions.push(factionId);
        }
        else if (this.firstFaction()) {
            this.secondActionChosen(action);
            this.secondFaction(factionId);
        }
        else {
            this.firstActionChosen(action);
            this.firstFaction(factionId);
        }
        this.currentSequenceForCard().addAction(factionId, action);
        this.state.turnHistory.commitTurn(action);
    }

    nextFaction(currentCard) {
        return _.find(
            currentCard.initiativeOrder, (factionId) => {
                return _.indexOf(this.eligibleFactions(), factionId) >= 0;
            });
    }

    remainEligible(factionId) {
        this.forcedEligibleFactionIds.push(factionId);
    }

    ineligibleThroughNext(factionId) {
        if(this.eligibleFactions.remove(factionId).length > 0) {
            this.ineligibleFactions.push(factionId);
        }
        if(this.passedFactions.remove(factionId).length > 0) {
            this.ineligibleFactions.push(factionId);
        }
        this.forcedIneligibleFactionIds.push(factionId);
    }

    canUndo() {
        return this.currentSequenceForCard().numActionsTaken() > 0 || this.history().length > 0;
    }

    isStartOfCard() {
        return this.currentSequenceForCard().numActionsTaken() === 0;
    }

    undo() {
        if(this.currentSequenceForCard().numActionsTaken() === 0) {
            if(this.history().length > 0) {
                this.currentSequenceForCard(this.history.pop());
                this.eligibleFactions(_.clone(this.currentSequenceForCard().eligible));
                this.ineligibleFactions(_.clone(this.currentSequenceForCard().ineligible));
                _.each(this.currentSequenceForCard().actions(), (actionData) => {
                    if(actionData.actionId === FactionActions.PASS) {
                        this.eligibleFactions.remove(actionData.factionId);
                        this.passedFactions.push(actionData.factionId);
                    }
                    else if(!this.firstFaction()) {
                        this.eligibleFactions.remove(actionData.factionId);
                        this.firstFaction(actionData.factionId);
                        this.firstActionChosen(actionData.actionId);
                    }
                    else {
                        this.eligibleFactions.remove(actionData.factionId);
                        this.secondFaction(actionData.factionId);
                        this.secondActionChosen(actionData.actionId);
                    }
                });
                return false;
            }
            else {
                return false;
            }
        }

        const lastAction = this.currentSequenceForCard().popAction();
        if(lastAction.actionId === FactionActions.PASS) {
            this.passedFactions.remove(lastAction.factionId);
            this.eligibleFactions.push(lastAction.factionId);
        }
        else if(this.secondFaction() === lastAction.factionId) {
            this.secondFaction(null);
            this.secondActionChosen(null);
            this.eligibleFactions.push(lastAction.factionId);
        }
        else if(this.firstFaction() === lastAction.factionId) {
            this.firstFaction(null);
            this.firstActionChosen(null);
            this.eligibleFactions.push(lastAction.factionId);
        }
        return true;
    }

    logState() {
        console.log('Eligible Factions: ' + _.join(this.eligibleFactions()));
        console.log('Passed Factions: ' + _.join(this.passedFactions()));
        console.log('Ineligible Factions: ' + _.join(this.ineligibleFactions()));
        if (this.firstFaction()) {
            console.log('First Faction:  ' + this.firstFaction() + ' (' + this.firstActionChosen() + ')');
        }
        if (this.secondFaction()) {
            console.log('Second Faction:  ' + this.secondFaction() + ' (' + this.secondActionChosen() + ')');
        }
    }

}

export default SequenceOfPlay;