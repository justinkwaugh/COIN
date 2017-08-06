import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';
import CommandIDs from '../../config/commandIds';
import RegionGroups from '../../config/regionGroups';
import TribeIDs from '../../config/tribeIds';
import Rally from '../../commands/rally';
import PlaceAlliedTribe from '../../actions/placeAlliedTribe';
import PlaceWarbands from '../../actions/placeWarbands';

class GermanicRally {
    static rally(state, modifiers) {
        console.log('*** Germanic Rally ***');
        const turn = state.turnHistory.getCurrentTurn();
        turn.startCommand(CommandIDs.RALLY);
        this.placeAllies(state, modifiers);
        this.placeWarbands(state, modifiers);
        turn.commitCommand();
    }

    static placeAllies(state, modifiers) {
        const rallyResults = Rally.test(state, {factionId: FactionIDs.GERMANIC_TRIBES});
        const allyRallies = _(rallyResults).filter({canAddAlly: true}).map(
            function (rallyResult) {
                let priority = 'c';
                const subduedSuebi = _.find(
                    rallyResult.region.tribes(), function (tribe) {
                        return tribe.isSubdued() && tribe.id === TribeIDs.SUEBI_NORTH || tribe.id === TribeIDs.SUEBI_SOUTH;
                    });
                if (subduedSuebi) {
                    priority = 'a';
                }
                else if (rallyResult.region.group === RegionGroups.GERMANIA) {
                    priority = 'b';
                }
                return {rallyResult, priority};
            }).sortBy('priority').groupBy('priority').map(_.shuffle).flatten().map('rallyResult').value();

        const germanicFaction = state.factionsById[FactionIDs.GERMANIC_TRIBES];

        while (germanicFaction.availableAlliedTribes() && allyRallies.length > 0) {
            const nextRally = allyRallies.shift();
            PlaceAlliedTribe.execute(
                state, {
                    factionId: germanicFaction.id,
                    regionId: nextRally.region.id,
                    tribeId: this.getAllyDestinationTribe(nextRally.region).id
                });
        }
    }

    static getAllyDestinationTribe( region ) {
        const subdued = _(region.tribes()).filter(
                function (tribe) {
                    return tribe.isSubdued();
                }).value();

        const suebi = _.find(
                subdued, function (tribe) {
                    return tribe.id === TribeIDs.SUEBI_NORTH || tribe.id === TribeIDs.SUEBI_SOUTH;
                });

        return suebi || _.sample(subdued)
    }

    static placeWarbands(state, modifiers) {
        const rallyResults = Rally.test(state, {factionId: FactionIDs.GERMANIC_TRIBES});
        const warbandResults = _(rallyResults).filter(result => result.canAddNumWarbands > 0).shuffle().value();
        const germanicFaction = state.factionsById[FactionIDs.GERMANIC_TRIBES];
        _.each(
            warbandResults, function (result) {
                PlaceWarbands.execute(
                    state, {
                        factionId: germanicFaction.id,
                        regionId: result.region.id,
                        count: Math.min(result.canAddNumWarbands, germanicFaction.availableWarbands().length)
                    });

                if (germanicFaction.availableWarbands().length === 0) {
                    return false;
                }
            });
    }
}

export default GermanicRally