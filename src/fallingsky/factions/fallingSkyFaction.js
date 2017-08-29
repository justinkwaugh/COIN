import _ from '../../lib/lodash';
import ko from '../../lib/knockout';
import Faction from '../../common/faction';
import Warband from '../pieces/warband';
import Leader from '../pieces/leader';
import AlliedTribe from '../pieces/alliedTribe';
import Citadel from '../pieces/citadel';

class FallingSkyFaction extends Faction {
    constructor(definition) {
        super(definition);
        this.resources = ko.observable(0);
        this.numWarbands = definition.numWarbands || 0;
        this.numAlliedTribes = definition.numAlliedTribes || 0;
        this.numCitadels = definition.numCitadels || 0;
        this.hasLeader = definition.hasLeader || false;
        this.passResources = definition.passResources || 1;

        this.availableLeader = ko.observable();
        if(this.hasLeader) {
            this.availableLeader (new Leader({factionId: definition.id, name: definition.leaderName}));
        }

        this.availableWarbands = ko.observableArray(
            _.map(
                _.range(definition.numWarbands), function () {
                    return new Warband({factionId: definition.id});
                }));
        this.availableAlliedTribes = ko.observableArray(
            _.map(
                _.range(definition.numAlliedTribes), function () {
                    return new AlliedTribe({factionId: definition.id});
                }));
        this.availableCitadels = ko.observableArray(
            _.map(
                _.range(definition.numCitadels), function () {
                    return new Citadel({factionId: definition.id});
                }));

        this.numAlliedTribesAndCitadelsPlaced = ko.pureComputed(
            () => {
                return (this.numAlliedTribes + this.numCitadels) -
                       (this.availableAlliedTribes().length + this.availableCitadels().length);
            });
    }

    victoryMargin(state) {
        return -100;
    }

    isHomeRegion(region) {
        return false;
    }

    setResources(count) {
        this.resources(count);
    }

    addResources(count) {
        const resourcesBeforeAdd = this.resources();
        const resourcesAfterAdd = Math.min(this.resources() + count, 45);
        if (resourcesBeforeAdd === resourcesAfterAdd) {
            return 0;
        }
        this.resources(resourcesAfterAdd);
        console.log(this.name + ' is adding ' + (resourcesAfterAdd - resourcesBeforeAdd) + ' resources.  Now at ' + resourcesAfterAdd);
        return resourcesAfterAdd - resourcesBeforeAdd;
    }

    removeResources(count) {
        const resourcesBeforeRemove = this.resources();
        const resourcesAfterRemove = Math.max(this.resources() - count, 0);
        if (resourcesBeforeRemove === resourcesAfterRemove) {
            return 0;
        }
        this.resources(resourcesAfterRemove);
        console.log(this.name + ' is removing ' + (resourcesBeforeRemove - resourcesAfterRemove) + ' resources.  Now at ' + resourcesAfterRemove);
        return resourcesBeforeRemove - resourcesAfterRemove;
    }

    hasAvailableLeader() {
        return this.availableLeader();
    }

    removeLeader() {
        const leader = this.availableLeader();
        this.availableLeader(null);
        return leader;
    }

    returnLeader(leader) {
        leader.isSuccessor(true);
        this.availableLeader(leader);
    }

    hasAvailableWarbands(count) {
        return count <= this.availableWarbands().length;
    }

    numPlacedWarbands() {
        return this.numWarbands - this.availableWarbands().length;
    }

    removeWarbands(count) {
        return this.availableWarbands.splice(0, count);
    }

    returnWarbands(warbands) {
        _.each(
            warbands, function (warband) {
                warband.revealed(false);
                warband.scouted(false);
            });
        this.availableWarbands.push.apply(this.availableWarbands, warbands);
    }

    hasAvailableAlliedTribe() {
        return this.availableAlliedTribes().length > 0;
    }

    removeAlliedTribe() {
        return this.availableAlliedTribes.pop();
    }

    returnAlliedTribe(alliedTribe) {
        if (alliedTribe) {
            this.availableAlliedTribes.push(alliedTribe);
        }
    }

    returnAlliedTribes(alliedTribes) {
        if (alliedTribes) {
            this.availableAlliedTribes.push.apply(this.availableAlliedTribes, alliedTribes);
        }
    }

    hasAvailableCitadel() {
        return this.availableCitadels().length > 0;
    }

    removeCitadel() {
        return this.availableCitadels.pop();
    }

    returnCitadel(citadel) {
        this.availableCitadels.push(citadel);
    }

    hasPlacedCitadel() {
        return this.numCitadels - this.availableCitadels().length;
    }

    logState(state) {
        console.log('*** ' + this.name + ' Faction ***');
        if (state) {
            console.log('    Victory Margin: ' + this.victoryMargin(state));
        }
        console.log('    Resources: ' + this.resources());
        if (this.availableLeader) {
            console.log('    Available Leader: ' + (this.availableLeader() ? this.availableLeader().toString() : 'None'));
        }
        console.log('    Available Citadels: ' + this.availableCitadels().length);
        console.log('    Available Allies: ' + this.availableAlliedTribes().length);
        console.log('    Available Warbands: ' + this.availableWarbands().length);
    }

    getAllPieces() {
        const pieces = _.concat(this.availableWarbands(), this.availableAlliedTribes(), this.availableCitadels());
        const leader = this.availableLeader();
        if(leader) {
            pieces.push(leader);
        }
        return pieces;
    }
}

export default FallingSkyFaction;