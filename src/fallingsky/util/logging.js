import _ from '../../lib/lodash';

class Logging {

    static logPieces(pieces) {
        _.each(this.getPiecesList(pieces), (piece)=>{
            console.log('    ' + piece);
        });
    }

    static getPiecesList(pieces) {
        const list = [];

        const piecesByType = _.groupBy(pieces, 'type');

        const leaders = piecesByType.leader;
        _.each(leaders, function (leader) {
                list.push(leader.toString());
            });

        const citadels = piecesByType.citadel;
        _.each(citadels, function (citadel) {
                list.push(citadel.tribeId + ' Citadel');
            });

        const forts = piecesByType.fort;
        if (forts) {
            list.push('Roman Fort');
        }

        const allies = piecesByType.alliedtribe;
        _.each(allies, function (ally) {
                list.push(ally.tribeId + ' Ally');
            });

        const legions = piecesByType.legion;
        if (legions) {
            list.push(legions.length + 'x Legions');
        }

        let status;
        const warbands = piecesByType.warband;
        if (warbands) {
            status = _.groupBy(warbands, warband=> warband.status());
            list.push(warbands.length + 'x Warbands (' +
                (status.hidden ? status.hidden.length : 0) + ' hidden, ' +
                (status.revealed ? status.revealed.length : 0) + ' revealed, ' +
                (status.scouted ? status.scouted.length : 0) + ' scouted)');
        }

        const auxilia = piecesByType.auxilia;
        if (auxilia) {
            status = _.groupBy(auxilia, oneAuxilia => oneAuxilia.status());
            list.push(auxilia.length + 'x Auxilia (' +
                (status.hidden ? status.hidden.length : 0) + ' hidden, ' +
                (status.revealed ? status.revealed.length : 0) + ' revealed)');
        }

        return list;
    }

}

export default Logging;