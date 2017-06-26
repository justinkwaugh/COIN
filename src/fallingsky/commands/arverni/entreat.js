import _ from '../../../lib/lodash';
import Command from '../command';
import FactionIDs from '../../config/factionIds';
import RemovePieces from '../../actions/removePieces';
import PlaceAlliedTribe from '../../actions/placeAlliedTribe';
import PlaceWarbands from '../../actions/placeWarbands';
import EntreatResults from './entreatResults';

class Entreat extends Command {

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
                const hiddenArverni = region.getHiddenPiecesForFaction(FactionIDs.ARVERNI).length > 0;

                if (!isValidRegion || !hiddenArverni) {
                    return;
                }

                const { replaceableAllyFactions, replaceableMobileFactions } = this.calculateEffects(region);

                if(replaceableAllyFactions.length === 0 && replaceableMobileFactions.length === 0) {
                    return;
                }

                return new EntreatResults(
                    {
                        cost: 1,
                        region,
                        replaceableAllyFactions,
                        replaceableMobileFactions,
                    });
            }).compact().value();
    }

    static doExecute(state, args) {
        const arverni = state.arverni;
        const entreat = args.entreat;
        console.log('*** Arverni Entreating region ' + entreat.region.name);

        if(entreat.allyToReplace) {
            const tribeId = entreat.allyToReplace.tribeId;
            RemovePieces.execute(
                    state, {
                        regionId: entreat.region.id,
                        factionId: entreat.allyToReplace.factionId,
                        pieces: [entreat.allyToReplace]
                    });

            if(arverni.availableAlliedTribes().length > 0) {
                PlaceAlliedTribe.execute(
                    state, {
                        regionId: entreat.region.id,
                        factionId: arverni.id,
                        tribeId: tribeId
                    });
            }
        }

        if(entreat.mobileToReplace) {
            RemovePieces.execute(
                    state, {
                        regionId: entreat.region.id,
                        factionId: entreat.mobileToReplace.factionId,
                        pieces: [entreat.mobileToReplace]
                    });

            if(arverni.availableWarbands().length > 0) {
                PlaceWarbands.execute(
                    state, {
                        regionId: entreat.region.id,
                        factionId: arverni.id,
                        count: 1
                    });
            }
        }
    }

    static calculateEffects(region) {
        const arverniControlled = region.controllingFactionId() === FactionIDs.ARVERNI;
        const replaceableAllyFactions = arverniControlled ? _(region.pieces()).filter({type : 'alliedtribe'}).reject({factionId : FactionIDs.ROMANS}).reject({factionId : FactionIDs.ARVERNI}).map('factionId').uniq().value() : [];
        const replaceableMobileFactions = _(region.pieces()).filter(piece=>(piece.type === 'warband' || piece.type === 'auxilia')).map('factionId').reject({factionId : FactionIDs.ARVERNI}).uniq().value();
        return {
            replaceableAllyFactions,
            replaceableMobileFactions
        }
    }

    static findLeaderRegion(state) {
        return _.find(
            state.regions, function (region) {
                return region.getLeaderForFaction(FactionIDs.ARVERNI);
            });
    }

}

export default Entreat;