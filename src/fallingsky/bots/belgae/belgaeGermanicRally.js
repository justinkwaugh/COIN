import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';
import Rally from '../../commands/rally';
import PlaceAlliedTribe from '../../actions/placeAlliedTribe';
import PlaceWarbands from '../../actions/placeWarbands';

class BelgaeGermanicRally {
    static rally(state, modifiers, enlistResults) {
        let effective = false;
        const validRegions = _.map(enlistResults, result => result.region.id);
        const effectiveRally = this.findEffectiveRally(state, modifiers, validRegions);
        if (effectiveRally) {
            console.log('*** Belgae Enlisted Germanic Rally ***');
            const germanicFaction = state.factionsById[FactionIDs.GERMANIC_TRIBES];
            if (effectiveRally.allyAdded) {
                PlaceAlliedTribe.execute(
                    state, {
                        factionId: germanicFaction.id,
                        regionId: effectiveRally.region.id,
                        tribeId: this.getAllyDestinationTribe(effectiveRally.region).id
                    });
            }
            if (effectiveRally.numWarbandsAdded > 0) {
                PlaceWarbands.execute(
                    state, {
                        factionId: germanicFaction.id,
                        regionId: effectiveRally.region.id,
                        count: Math.min(effectiveRally.numWarbandsAdded, germanicFaction.availableWarbands().length)
                    });
            }
            effective = true;
        }
        return effective;
    }

    static findEffectiveRally(state, modifiers, validRegions) {
        const rallyResults = Rally.test(state, {factionId: FactionIDs.GERMANIC_TRIBES});
        return _(rallyResults).filter({allyAdded: true}).map(
            function (rallyResult) {
                if (_.indexOf(validRegions, rallyResult.region.id) < 0) {
                    return;
                }

                let priority = 'c';
                if (rallyResult.allyAdded) {
                    priority = 'a';
                }
                else {
                    priority = 'b' + 99 - rallyResult.numWarbandsAdded;
                }
                return {rallyResult, priority};
            }).compact().sortBy('priority').groupBy('priority').map(_.shuffle).flatten().map('rallyResult').first();

    }

    static getAllyDestinationTribe(region) {
        const subdued = _(region.tribes()).filter(
            function (tribe) {
                return tribe.isSubdued();
            }).value();
        return _.sample(subdued)
    }

    static placeWarbands(state, modifiers) {
        const rallyResults = Rally.test(state, {factionId: FactionIDs.GERMANIC_TRIBES});
        const warbandResults = _(rallyResults).filter('numWarbandsAdded').sampleSize(rallyResults.length).value();
        const germanicFaction = state.factionsById[FactionIDs.GERMANIC_TRIBES];
        _.each(
            warbandResults, function (result) {
                PlaceWarbands.execute(
                    state, {
                        factionId: germanicFaction.id,
                        regionId: result.region.id,
                        count: Math.min(result.numWarbandsAdded, germanicFaction.availableWarbands().length)
                    });

                if (germanicFaction.availableWarbands().length === 0) {
                    return false;
                }
            });
    }
}

export default BelgaeGermanicRally