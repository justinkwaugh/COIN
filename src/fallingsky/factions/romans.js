import _ from '../../lib/lodash';
import ko from '../../lib/knockout';
import FallingSkyFaction from './fallingSkyFaction';
import RegionIDs from '../config/regionIds';
import FactionIDs from '../config/factionIds';
import Auxilia from '../pieces/auxilia';
import PlaceAuxilia from 'fallingsky/actions/placeAuxilia';
import PlaceLegions from 'fallingsky/actions/placeLegions';
import ReturnLegions from 'fallingsky/actions/returnLegions';
import Fort from '../pieces/fort';
import Legion from '../pieces/legion';
import {SenateApprovalStates, SenateApprovalStateNames} from 'fallingsky/config/senateApprovalStates';
import ChangeSenateApproval from 'fallingsky/actions/changeSenateApproval';


class Romans extends FallingSkyFaction {
    constructor() {
        const definition = {
            id: FactionIDs.ROMANS,
            name: 'Romans',
            numWarbands: 0,
            numAlliedTribes: 6,
            numCitadels: 0,
            hasLeader: true,
            leaderName: 'Julius Caesar',
            passResources: 2
        };
        super(definition);

        this.availableAuxilia = ko.observableArray(
            _.map(
                _.range(20), function () {
                    return new Auxilia({factionId: definition.id});
                }));

        this.availableForts = ko.observableArray(
            _.map(
                _.range(6), function () {
                    return new Fort({factionId: definition.id});
                }));

        this.availableLegions = ko.observableArray(
            _.map(
                _.range(12), function () {
                    return new Legion({factionId: definition.id});
                }));

        this.availableDispersalTokens = ko.observable(4);

        this.senateApprovalState = ko.observable();
        this.senateFirm = ko.observable();

        this.uproarLegions = ko.observableArray();
        this.intrigueLegions = ko.observableArray();
        this.adulationLegions = ko.observableArray();
        this.fallenLegions = ko.observableArray();
        this.lostEagle = ko.observable();
        this.lostEagleYear = ko.observable(-1);


        this.senateApprovalText = ko.pureComputed(() => {
            return (this.senateFirm() ? 'Firm ' : '') + SenateApprovalStateNames[this.senateApprovalState()];
        });

        this.offMapLegions = ko.pureComputed(
            () => {
                return this.availableLegions().length +
                       (this.lostEagle() ? 1: 0) +
                       this.fallenLegions().length +
                       this.adulationLegions().length +
                       this.intrigueLegions().length +
                       this.uproarLegions().length;
            });
    }

    victoryMargin(state) {
        return this.victoryScore(state) - 15;
    }

    victoryScore(state) {
        return _.reduce(
            state.tribes, function (sum, tribe) {
                if (tribe.isDispersed() || tribe.isSubdued() || (tribe.isAllied() && tribe.alliedFactionId() === FactionIDs.ROMANS)) {
                    return sum + 1;
                }
                return sum;
            }, 0);
    }

    isHomeRegion(region) {
        return region.id === RegionIDs.PROVINCIA;
    }

    setSenateApproval(state) {
        this.senateApprovalState(state);
    }

    hasAvailableAuxilia(count) {
        return count <= this.availableAuxilia().length;
    }

    removeAuxilia(count) {
        return this.availableAuxilia.splice(0, count);
    }

    returnAuxilia(auxilia) {
        _.each(
            auxilia, function (piece) {
                piece.revealed(false);
            });
        this.availableAuxilia.push.apply(this.availableAuxilia, auxilia);
    }

    hasAvailableForts() {
        return this.availableForts().length > 0;
    }

    removeFort() {
        return this.availableForts.pop();
    }

    returnFort(fort) {
        this.availableForts.push(fort);
    }

    initializeLegionTrack(state, count) {
        const legionData = this.removeLegions(count);
        const legions = legionData.legions;

        if (state === SenateApprovalStates.UPROAR) {
            this.uproarLegions.push.apply(this.uproarLegions, legions);
        }
        if (state === SenateApprovalStates.INTRIGUE) {
            this.intrigueLegions.push.apply(this.intrigueLegions, legions);
        }
        if (state === SenateApprovalStates.ADULATION) {
            this.adulationLegions.push.apply(this.adulationLegions, legions);
        }
    }

    numLegionsInTrack() {
        return this.uproarLegions().length + this.intrigueLegions().length + this.adulationLegions().length;
    }

    hasAvailableLegions(count) {
        let availableCount = this.availableLegions().length;

        if (this.senateApprovalState() >= SenateApprovalStates.UPROAR) {
            availableCount += this.uproarLegions().length;
        }
        if (this.senateApprovalState() >= SenateApprovalStates.INTRIGUE) {
            availableCount += this.intrigueLegions().length;
        }
        if (this.senateApprovalState() === SenateApprovalStates.ADULATION) {
            availableCount += this.adulationLegions().length;
        }
        return count <= availableCount;
    }

    getLegionsFromFallen(count) {
        return this.fallenLegions.splice(0, count);
    }

    removeLegions(count, ignoreSenate) {
        const removedLegions = [];
        const sourceCounts = {};
        let numLeft = count;
        let currentNumToRemove = 0;
        if (this.availableLegions().length > 0) {
            currentNumToRemove = Math.min(this.availableLegions().length, numLeft);
            removedLegions.push.apply(removedLegions, this.availableLegions.splice(0, currentNumToRemove));
            numLeft -= currentNumToRemove;
        }
        if (numLeft && (ignoreSenate || this.senateApprovalState() >= SenateApprovalStates.UPROAR)) {
            currentNumToRemove = Math.min(this.uproarLegions().length, numLeft);
            if(currentNumToRemove > 0) {
                sourceCounts[SenateApprovalStates.UPROAR] = currentNumToRemove;
                removedLegions.push.apply(removedLegions, this.uproarLegions.splice(0, currentNumToRemove));
                numLeft -= currentNumToRemove;
            }
        }
        if (numLeft && (ignoreSenate || this.senateApprovalState() >= SenateApprovalStates.INTRIGUE)) {
            currentNumToRemove = Math.min(this.intrigueLegions().length, numLeft);
            if(currentNumToRemove > 0) {
                sourceCounts[SenateApprovalStates.INTRIGUE] = currentNumToRemove;
                removedLegions.push.apply(removedLegions, this.intrigueLegions.splice(0, currentNumToRemove));
                numLeft -= currentNumToRemove;
            }
        }
        if (numLeft && (ignoreSenate || this.senateApprovalState() >= SenateApprovalStates.ADULATION)) {
            currentNumToRemove = Math.min(this.adulationLegions().length, numLeft);
            if(currentNumToRemove > 0) {
                sourceCounts[SenateApprovalStates.ADULATION] = currentNumToRemove;
                removedLegions.push.apply(removedLegions, this.adulationLegions.splice(0, currentNumToRemove));
                numLeft -= currentNumToRemove;
            }
        }
        return {
            legions: removedLegions,
            sourceCounts
        };
    }

    returnLegions(legions, track) {
        if (track === SenateApprovalStates.UPROAR) {
            this.uproarLegions.push.apply(this.uproarLegions, legions);
        }
        else if (track === SenateApprovalStates.INTRIGUE) {
            this.intrigueLegions.push.apply(this.intrigueLegions, legions);
        }
        else if (track === SenateApprovalStates.ADULATION) {
            this.adulationLegions.push.apply(this.adulationLegions, legions);
        }
        else {
            this.fallenLegions.push.apply(this.fallenLegions, legions);
        }
    }

    hasAvailableDispersalTokens() {
        return this.availableDispersalTokens() > 0;
    }

    removeDispersalToken() {
        this.availableDispersalTokens(this.availableDispersalTokens() - 1);
    }

    returnDispersalToken() {
        this.availableDispersalTokens(this.availableDispersalTokens() + 1);
    }

    adjustSenateApproval(state) {
        const romanVictory = this.victoryScore(state);
        const currentSenateApproval = this.senateApprovalState();

        let newSenateApprovalFromVictoryMargin = null;
        if (romanVictory < 10) {
            newSenateApprovalFromVictoryMargin = SenateApprovalStates.UPROAR;
        }
        else if (romanVictory < 13) {
            newSenateApprovalFromVictoryMargin = SenateApprovalStates.INTRIGUE;
        }
        else {
            newSenateApprovalFromVictoryMargin = SenateApprovalStates.ADULATION;
        }

        let newSenateApproval = currentSenateApproval;
        let newFirm = this.senateFirm();

        if (newSenateApprovalFromVictoryMargin > currentSenateApproval) {
            if (this.fallenLegions().length > 0) {
                console.log('No change in approval due to fallen legions');
            }
            else if (this.lostEagleYear() === state.year()) {
                console.log('No change in approval due to lost eagle');
            }
            else if (currentSenateApproval === SenateApprovalStates.UPROAR && this.senateFirm()) {
                newFirm = false;
            }
            else {
                newSenateApproval = currentSenateApproval + 1;
            }
        }
        else if (currentSenateApproval === SenateApprovalStates.ADULATION) {
            newFirm = true;
        }
        else if (currentSenateApproval === SenateApprovalStates.UPROAR) {
            newFirm = true;
        }
        else if (newSenateApprovalFromVictoryMargin < currentSenateApproval) {
            if (currentSenateApproval === SenateApprovalStates.ADULATION && this.senateFirm()) {
                newFirm = false;
            }
            else {
                newSenateApproval = currentSenateApproval - 1;
            }
        }

        if (newSenateApproval !== currentSenateApproval || newFirm !== this.senateFirm()) {
            ChangeSenateApproval.execute(state, {approvalState: newSenateApproval, isFirm: newFirm});
            this.logSenateApproval();
        }
    }

    returnLegionsFromFallen(state, args = {spring: false}) {
        const spring = args.spring;
        const numFallenLegions = this.fallenLegions().length;
        const numRemaining = spring ? 0 : Math.floor(numFallenLegions / 2.0);
        const returning = numFallenLegions - numRemaining;

        if(returning > 0) {
            ReturnLegions.execute(state, {count: returning});
        }
    }

    returnLegionsToTracks(legions) {
        if (this.adulationLegions().length < 4) {
            const numSlots = 4 - this.adulationLegions().length;
            const numToReturn = Math.min(numSlots, legions.length);
            this.adulationLegions.push.apply(this.adulationLegions, legions.splice(0, numToReturn));
        }
        if (legions.length > 0 && this.intrigueLegions().length < 4) {
            const numSlots = 4 - this.intrigueLegions().length;
            const numToReturn = Math.min(numSlots, legions.length);
            this.intrigueLegions.push.apply(this.intrigueLegions, legions.splice(0, numToReturn));
        }
        if (legions.length > 0 && this.uproarLegions().length < 4) {
            const numSlots = 4 - this.uproarLegions().length;
            const numToReturn = Math.min(numSlots, legions.length);
            this.uproarLegions.push.apply(this.uproarLegions, legions.splice(0, numToReturn));
        }
    }


    placeWinterLegions(state) {
        const numToPlace = _.reduce(SenateApprovalStates, (sum, approvalState) => {
            if (this.senateApprovalState() < approvalState) {
                return sum;
            }

            if (approvalState === SenateApprovalStates.UPROAR) {
                return sum + this.uproarLegions().length;
            }
            else if (approvalState === SenateApprovalStates.INTRIGUE) {
                return sum + this.intrigueLegions().length;
            }
            else if (approvalState === SenateApprovalStates.ADULATION) {
                return sum + this.adulationLegions().length;
            }
        }, 0);

        if (numToPlace > 0) {
            PlaceLegions.execute(state, {
                factionId: FactionIDs.ROMANS,
                regionId: RegionIDs.PROVINCIA,
                count: numToPlace
            })
        }
    }

    placeWinterAuxilia(state) {
        const provincia = state.regionsById[RegionIDs.PROVINCIA];
        const leaderInProvincia = _.find(provincia.piecesByFaction[FactionIDs.ROMANS], {type: 'leader'});
        if (leaderInProvincia && this.availableAuxilia().length > 0) {
            if (this.senateApprovalState() === SenateApprovalStates.UPROAR) {
                PlaceAuxilia.execute(state, {
                    factionId: this.id,
                    regionId: provincia.id,
                    count: Math.min(3, this.availableAuxilia().length)
                });
            }
            else if (this.senateApprovalState() === SenateApprovalStates.INTRIGUE) {
                PlaceAuxilia.execute(state, {
                    factionId: this.id,
                    regionId: provincia.id,
                    count: Math.min(4, this.availableAuxilia().length)
                });
            }
            else if (this.senateApprovalState() === SenateApprovalStates.ADULATION) {
                PlaceAuxilia.execute(state, {
                    factionId: this.id,
                    regionId: provincia.id,
                    count: Math.min(5, this.availableAuxilia().length)
                });
            }
        }
    }

    logSenateApproval() {
        let approvalText = 'Senate is in a state of ';
        if (this.senateApprovalState() === SenateApprovalStates.ADULATION) {
            if (this.senateFirm()) {
                approvalText += 'firm adulation';
            }
            else {
                approvalText += 'adulation';
            }
        }
        else if (this.senateApprovalState() === SenateApprovalStates.INTRIGUE) {
            approvalText += 'intrigue';
        }
        if (this.senateApprovalState() === SenateApprovalStates.UPROAR) {
            if (this.senateFirm()) {
                approvalText += 'firm uproar';
            }
            else {
                approvalText += 'uproar';
            }
        }
        console.log(approvalText);
    }

    logState(state) {
        console.log('*** ' + this.name + ' Faction ***');
        if (state) {
            console.log('    Victory Margin: ' + this.victoryMargin(state));
        }
        console.log('    Resources: ' + this.resources());
        console.log('    Available Leader: ' + (this.availableLeader() ? this.availableLeader().toString() : 'None'));
        console.log('    Available Forts: ' + this.availableForts().length);
        console.log('    Available Allies: ' + this.availableAlliedTribes().length);
        console.log('    Available Auxilia: ' + this.availableAuxilia().length);
        console.log('    Senate Approval: ' + this.senateApprovalState() + (this.senateFirm() ? ' Firm' : ''));
        console.log('    Uproar Legions: ' + this.uproarLegions().length);
        console.log('    Intrigue Legions: ' + this.intrigueLegions().length);
        console.log('    Adulation Legions: ' + this.adulationLegions().length);
        console.log('    Fallen Legions: ' + this.fallenLegions().length);
    }
}

export default Romans;