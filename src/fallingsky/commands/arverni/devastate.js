import _ from '../../../lib/lodash';
import Command from '../command';
import FactionIDs from '../../config/factionIds';
import RemovePieces from '../../actions/removePieces';
import DevastateResults from './devastateResults';
import Losses from 'fallingsky/util/losses';

class Devastate extends Command {

    static doTest(state, args) {
        const leaderRegion = this.findLeaderRegion(state);
        if (!leaderRegion) {
            return false;
        }
        const leader = leaderRegion.getLeaderForFaction(FactionIDs.ARVERNI);
        const isVercingetorix = leader && !leader.isSuccessor();
        const validRegionIds = isVercingetorix ? _(leaderRegion.adjacent).concat([leaderRegion]).map('id').value() : [leaderRegion];

        return _(state.regions).map(
            (region) => {
                const isValidRegion = _.indexOf(validRegionIds, region.id) >= 0;
                const arverniControlled = region.controllingFactionId() === FactionIDs.ARVERNI;

                if (region.devastated() || !isValidRegion || !arverniControlled) {
                    return;
                }

                const removals = this.calculateRemovals(state, region);

                return new DevastateResults(
                    {
                        region,
                        removedArverni: removals[FactionIDs.ARVERNI].piecesToRemove,
                        removedBelgae: removals[FactionIDs.BELGAE].piecesToRemove,
                        removedAedui: removals[FactionIDs.AEDUI].piecesToRemove,
                        removedRomans: removals[FactionIDs.ROMANS].piecesToRemove,
                        removedGermanic: removals[FactionIDs.GERMANIC_TRIBES].piecesToRemove
                    });
            }).compact().value();
    }

    static doExecute(state, args) {
        const devastation = args.devastation;
        console.log('*** Arverni Devastating region ' + devastation.region.name);
        devastation.region.devastated(true);

        const removals = this.calculateRemovals(state, devastation.region);
        _.each(
            removals, (removalData, factionId) => {
                RemovePieces.execute(
                    state, {
                        regionId: devastation.region.id,
                        factionId: factionId,
                        pieces: removalData.piecesToRemove
                    });
            });
    }

    static calculateRemovals(state, region) {
        return _(state.factions).map(
            (faction) => {
                const mobilePieces = _.reject(region.getMobilePiecesForFaction(faction.id), {type: 'leader'});
                const numPiecesToRemove = mobilePieces.length === 0 ? 0 : Math.floor(mobilePieces.length / (faction.id === FactionIDs.ARVERNI ? 4 : 3));
                const piecesToRemove = _.take(Losses.orderPiecesForRemoval(state.mobilePieces, false), numPiecesToRemove);
                return {
                    id: faction.id,
                    piecesToRemove
                }
            }).keyBy('id').value();
    }

    static findLeaderRegion(state) {
        return _.find(
            state.regions, function (region) {
                return region.getLeaderForFaction(FactionIDs.ARVERNI);
            });
    }

}

export default Devastate;