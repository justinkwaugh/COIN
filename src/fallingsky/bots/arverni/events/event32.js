import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import RegionIDs from 'fallingsky/config/regionIds';
import MovePieces from 'fallingsky/actions/movePieces';
import HidePieces from 'fallingsky/actions/hidePieces';

class Event20 {
    static handleEvent(state) {
        if (state.arverni.numAlliedTribesAndCitadelsPlaced() < 9) {
            return false;
        }

        let moveData = this.getLegionControlMoves(state);
        if (!moveData) {
            moveData = this.getMassMoves(state);
        }

        if (!moveData) {
            return false;
        }

        _.each(moveData.moves, move => {
            MovePieces.execute(
                state, {
                    sourceRegionId: move.regionId,
                    destRegionId: moveData.region.id,
                    pieces: move.pieces
                });
        });

        const movedPieces = _.reduce(moveData.moves, (pieces, move) => {
            return _.concat(pieces, move.pieces);
        },[]);

        HidePieces.execute(state, {
            factionId: FactionIDs.ARVERNI,
            regionId: moveData.region.id,
            pieces: _.reject(movedPieces, {type : 'leader'}),
            fully: true
        });

        return true;
    }

    static getLegionControlMoves(state) {
        return _(state.regions).filter(region => {
            if (region.id === RegionIDs.BRITANNIA) {
                return;
            }
            // Can't already be controlled by Arverni
            if (region.controllingFactionId() === FactionIDs.ARVERNI) {
                return false
            }

            // Has to have a legion
            const romanMobilePieces = region.getMobilePiecesForFaction(FactionIDs.ROMANS);
            const hasLegion = _.find(romanMobilePieces, {type: 'legion'});
            if (!hasLegion) {
                return false;
            }
        }).map(region => {
            const moves = _(state.regions).reject(sourceRegion=> sourceRegion.id === RegionIDs.BRITANNIA || sourceRegion.id === region.id).map(sourceRegion => {
                const pieces = sourceRegion.getMobilePiecesForFaction(FactionIDs.ARVERNI);
                if (pieces.length === 0) {
                    return;
                }

                return {
                    regionId: sourceRegion.id,
                    numPieces: pieces.length,
                    pieces
                }
            }).compact().value();

            const numMoved = _.sumBy(moves, 'numPieces');

            if (region.controllingMarginByFaction()[FactionIDs.ARVERNI] + numMoved <= 0) {
                return;
            }

            const romanMobilePieces = region.getMobilePiecesForFaction(FactionIDs.ROMANS);
            const hasCaesar = _.find(romanMobilePieces, piece => piece.type === 'leader' && !piece.isSuccessor());
            const numMobileAfterMoves = region.getMobilePiecesForFaction(FactionIDs.ARVERNI).length + numMoved;
            if (hasCaesar && (numMobileAfterMoves <= romanMobilePieces.length * 2)) {
                return;
            }

            const numAfterMoves = region.getPiecesForFaction(FactionIDs.ARVERNI).length + numMoved;

            return {
                region,
                moves,
                priority: 100 - numAfterMoves
            };

        }).compact().sortBy('priority').groupBy('priority').map(_.shuffle).flatten().first();
    }

    static getMassMoves(state) {
        return _(state.regions).filter(destination => {
            if (destination.id === RegionIDs.BRITANNIA) {
                return false;
            }

            return _.find(destination.adjacent, adjacent => adjacent.getLegions().length > 0);
        }).map(region => {
            const moves = _(state.regions).reject(sourceRegion=> sourceRegion.id === RegionIDs.BRITANNIA || sourceRegion.id === region.id).map(sourceRegion => {
                const pieces = sourceRegion.getMobilePiecesForFaction(FactionIDs.ARVERNI);
                if (pieces.length === 0) {
                    return;
                }

                return {
                    regionId: sourceRegion.id,
                    numPieces: pieces.length,
                    pieces
                }
            }).compact().value();

            const numMoved = _.sumBy(moves, 'numPieces');
            const numAfterMoves = region.getPiecesForFaction(FactionIDs.ARVERNI).length + numMoved;

            return {
                region,
                moves,
                priority: 100 - numAfterMoves
            };

        }).compact().sortBy('priority').groupBy('priority').map(_.shuffle).flatten().first();
    }
}

export default Event20