// # 1. a
// # 2. b
// # 3. c
// # 4. d
// # 5. e

// # o usuario pode subir ou descer a posição dos levels (representados por letras). por exemplo, subir o level 'e' para a posição 2, resultaria em:
// # 1. a
// # 2. e
// # 3. b
// # 4. c
// # 5. d

// # alem disso o usuario também pode adicionar e excluir levels.

// ideia: elaborar um algoritmo que gere uma string com as mudanças realizadas, incluindo mudanças, adições e exclusões de levels.

// no caso do exemplo acima, a string gerada seria:
// "E subiu de #5 para #2, ficando entre #1 e #3"

// portanto o modelo é o seguinte:

// para modificações de posição:
// se Z > 1: "X subiu/desceu de #Y para #Z, ficando entre #W e #V"
// se Z = 1: "X desceu de #Y para #Z, ficando acima de #V"

// para adições:
// "X foi adicionado em #Y, ficando entre #W e #V. Isso faz com que #L saia da lista"

// para exclusões:
// "X, que estava em #Y, foi excluído, isso faz com que #L retorne para #K"

// onde:
// X = level
// Y = posição anterior
// Z = nova posição
// W = level anterior
// V = level posterior
// L = level deslocado pela adição ou exclusão (o último level da lista ou o último level que saiu da lista)
// K = constante que representa o número máximo de levels (5 no caso do exemplo

// COMO IMPLEMENTAR ISSO?

// pretendo fazer vetores:
// - lista_og: vetor com as posições originais dos levels
// - lista_atual: vetor com as posições atuais dos levels, atualizado a cada mudança/adição/exclusão
// - lista_adicionados: vetor com os levels adicionados
// * Por que lista_adicionados? Embora não necessário, decidi criar esse vetor para agilizar a pesquisa. Ao modificar a posição de um level, eu preciso saber se ele foi adicionado ou não. Se não houvesse esse vetor, eu teria que percorrer a lista_og para saber se o level foi adicionado ou não. Com esse vetor, eu só preciso verificar se o level está na lista_adicionados.
// - logs: vetor de strings com os logs

// ok, mas como fazer isso?

// - Para modificar a posição:
// Eu primeiro conheço o nome do level e busco pela posição dele na lista_og. A lista_atual é atualizada com a nova posição, então eu consigo gerar a string de log. O level foi de onde ele estava na lista_og para onde ele está na lista_atual.
// COMPLICAÇÕES: e se o usuário mudar a posição de um level que foi adicionado?
// Para resolver isso, eu primeiro verifico se o nome do level está na lista_adicionados. Se estiver, eu não gero mais log, mas sim corrijo o log de adição que foi gerado ao adicionar o level.

// - Para adicionar:
// Eu adiciono o level na lista_adicionados, atualizo a lista_atual e gero a string de log. O level foi adicionado na posição que ele está na lista_atual. A adição vai expulsar o último level da lista, então eu preciso saber qual é esse level para gerar o log. Esse level vai ser a posição K (no vetor) da lista_atual, que vai conter o level que foi adicionado.

// - Para excluir:
// Eu obtenho o nome do level e excluo ele da lista_atual. A exclusão vai fazer com que o primeiro level > K na lista_atual seja incluido novamente na lista <= K. Ou seja, o log vai ser com base no nome do level excluído e no nome do level da posição K de lista_atual. Isso remove a necessidade de um vetor lista_excluidos.

// NOTAS:
// - ao tentar enviar as alterações, é interessante eu tirar a diferença entre a lista_og e a lista_atual. Se houver diferença, eu procedo com as alterações. Se não houver, eu aviso o usuário que não houve alterações.
// - eu posso fazer um vetor de strings para armazenar os logs, e a cada alteração eu adiciono um novo log. No final, eu imprimo todos os logs.

// - tratar em outro algoritmo: e se o usuário mover o level várias vezes? então será gerado vários logs de deslocamento. Portanto é interessante uma função que mescle logs de deslocamento que pertencem ao mesmo level, gerando um unico de onde ele saiu originalmente e onde ele parou na última modificação.

function lista(content, tratarListaAtual = false) {
    // mode = 0: lista_og, vai tratar content como jsonContent
    // mode = 1: lista_atual, vai tratar content como #level-table
    let lista = [];
    if (!tratarListaAtual) {
        for (let i = 0; i < content.length; i++) {
            lista.push(content[i].name_lvl);
        }
    } else {
        // pegar a célula 2 de cada linha (2 contando de 0, leia-se célula de nome dos levels)
        let rows = content.rows;
        for (let i = 1; i < rows.length; i++) {
            let cell = rows[i].cells[2];
            lista.push(cell.textContent);
        }
    }

    return lista;
}

function posicaoOriginal(level, lista_og) {
    return lista_og.indexOf(level) + 1;
}

function posicaoAtual(level, lista_atual) {
    return lista_atual.indexOf(level) + 1;
}

function levelAnterior(level, lista_atual) {
    let posicao = posicaoAtual(level, lista_atual);
    return posicao > 1 ? lista_atual[posicao - 2] : null;
}

function levelPosterior(level, lista_atual) {
    let posicao = posicaoAtual(level, lista_atual);
    return posicao < lista_atual.length ? lista_atual[posicao] : null;
}

function escrevaDeslocamento(level, posicaoAnterior, novaPosicao, levelAnterior, levelPosterior, levelAdicionado = false, levelExpulso = null) {
    if (posicaoAnterior === novaPosicao) {
        return null;
    }

    let log;
    

    if (!levelAdicionado) {
        let movimento = posicaoAnterior > novaPosicao ? 'subiu' : 'desceu';
        let posicao = novaPosicao > 1 ? `ficando entre ${levelAnterior} e ${levelPosterior}` : `ficando acima de ${levelPosterior}`;
        log = `${level} ${movimento} de #${posicaoAnterior} para #${novaPosicao}, ${posicao}`;
    } else {
        log = `${level} foi adicionado em #${novaPosicao}. Isso faz com que ${levelExpulso} saia da lista`;
    }
    return log;
}