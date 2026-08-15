(function () {
  "use strict";

  const chapters = [
    {
      id: "ch1",
      title: "基础巩固：气、吃子与劫",
      subtitle: "先把围棋最底层的规则吃透，后面的技巧才有意义。",
      items: [
        {
          id: "ch1-1",
          type: "lesson",
          title: "气与提子",
          intro: "围棋里最核心的一句话：没有气的棋子要被拿掉。",
          sections: [
            {
              kind: "text",
              html: "<p><strong>气</strong>，是指与棋子直线相邻的空交叉点。一颗棋子最多有四口气：上、下、左、右。</p><p>气越少，棋子越危险；当一块棋的气数变成 0，它就会被对方提掉。</p>",
            },
            {
              kind: "board",
              stones: ["B:D4"],
              next: "B",
              markers: ["C4", "D3", "E4", "D5"],
              note: "黑棋这颗子在 D4，它的四口气分别是 C4、D3、E4、D5。",
            },
            {
              kind: "text",
              html: "<p>如果一块棋只剩一口气，我们叫它<strong>被打吃</strong>，也就是只差一步就会被提掉。</p>",
            },
            {
              kind: "board",
              stones: ["W:D4", "B:C4", "B:D3", "B:E4"],
              next: "B",
              markers: ["D5"],
              note: "白 D4 的三口气已被黑棋堵住，只剩 D5 一口气。黑棋再下 D5，白棋就被提掉。",
            },
            {
              kind: "text",
              html: "<p><strong>提子</strong>：当你落下一子，使对方某块棋的气数变为 0 时，就要把对方这块棋全部从棋盘上拿掉。</p>",
            },
            {
              kind: "sequence",
              initial: { stones: ["W:D4", "B:C4", "B:D3", "B:E4"], next: "B" },
              steps: [{ move: "B:D5", note: "黑棋落在 D5，白 D4 没有气，整块白棋被提掉。" }],
              note: "点“下一手”观看提子过程。",
            },
          ],
        },
        {
          id: "ch1-2",
          type: "lesson",
          title: "禁着点与自杀",
          intro: "有些点看起来能下，其实规则不允许。",
          sections: [
            {
              kind: "text",
              html: "<p><strong>自杀</strong>：落子后，自己这块棋没有任何气，而且这手棋也提不掉对方棋子。这种下法是规则禁止的。</p>",
            },
            {
              kind: "board",
              stones: ["B:C4", "B:D3", "B:E4", "B:D5"],
              next: "W",
              markers: ["D4"],
              note: "白棋不能下在 D4：落子后白 D4 四周全是黑棋，自己没有气，也提不掉黑棋。",
            },
            {
              kind: "text",
              html: "<p>有一个例外：如果下进去的瞬间能提掉对方棋子，那么即使自己的子看起来没有气，也<strong>不算自杀</strong>，可以下。</p>",
            },
          ],
        },
        {
          id: "ch1-3",
          type: "lesson",
          title: "劫与找劫材",
          intro: "劫，是围棋里最特别的规则。",
          sections: [
            {
              kind: "text",
              html: "<p><strong>劫</strong>：当你提掉对方一颗子后，对方不能马上提回，否则棋局会无限循环。规则规定：对方必须先在别处下一手，这手棋叫<strong>找劫材</strong>。</p>",
            },
            {
              kind: "board",
              stones: ["B:C4", "B:D3", "B:E4", "W:D4", "W:C5", "W:E5", "W:D6"],
              next: "B",
              markers: ["D4", "D5"],
              note: "黑棋下 D5 可以提掉白 D4；但提完后，白棋不能立刻回提 D5，需要先找劫材。",
            },
            {
              kind: "text",
              html: "<p>先说说<strong>提子</strong>：把对方已经没有气的棋子从棋盘上拿掉，就叫提子。而<strong>劫</strong>的规矩很简单——你刚提掉对方一颗子，对方不能马上又提回来，必须先到别处下一手，不然棋局就会来回循环、下不完。</p>",
            },
          ],
        },
        {
          id: "ch1-quiz",
          type: "quiz",
          title: "第一章小测",
          intro: "完成下面的题目，检验一下基础概念。",
          questions: [
            {
              q: "一块棋的“气”是指什么？",
              options: ["棋子周围直线相邻的空交叉点", "棋盘上的白线", "棋盘角落的数量", "棋子的数量"],
              answer: 0,
              explain: "气是与棋子上下左右相邻的空点，气越少越危险。",
            },
            {
              q: "什么是“提子”？",
              options: ["把对方的棋子从棋盘上拿掉", "把自己棋子拿回棋盒", "移动一颗棋子", "向对方认输"],
              answer: 0,
              explain: "当对方棋子的气变为 0，就要把它提掉。",
            },
            {
              q: "关于“劫”，下列说法正确的是？",
              options: ["提劫后可以马上提回", "提劫后不能马上回提，需要先找劫材", "劫只能出现在角上", "劫就是双方连续提子"],
              answer: 1,
              explain: "为避免无限循环，规则禁止马上回提，必须先找劫材。",
            },
            {
              q: "哪种情况属于“自杀”，不能下？",
              options: ["落子后提掉对方棋子", "落子后自己有气", "落子后自己没气且提不掉对方", "落子后对方有两口气"],
              answer: 2,
              explain: "自己没气又提不掉对方，就是自杀，规则禁止。",
            },
          ],
        },
        {
          id: "ch1-p1",
          type: "puzzle",
          title: "黑先：一步提子",
          intro: "请找出让白棋立刻被提掉的那一手。",
          board: { stones: ["W:D4", "B:C4", "B:D3", "B:E4"], next: "B" },
          answer: ["D5"],
          explanation: "黑棋下 D5，白 D4 四周 C4、D3、E4、D5 全是黑棋，白棋没有气，被提掉。",
        },
        {
          id: "ch1-p2",
          type: "puzzle",
          title: "白先：一步提子",
          intro: "请找出让黑棋立刻被提掉的那一手。",
          board: { stones: ["B:D10", "W:C10", "W:D9", "W:E10"], next: "W" },
          answer: ["D11"],
          explanation: "白棋下 D11，黑 D10 四周 C10、D9、E10、D11 全是白棋，黑棋被提掉。",
        },
      ],
    },
    {
      id: "ch2",
      title: "死活基础：眼与活棋",
      subtitle: "判断一块棋是死是活，是所有攻防的前提。",
      items: [
        {
          id: "ch2-1",
          type: "lesson",
          title: "真眼与假眼",
          intro: "眼，是棋子的生命空间。",
          sections: [
            {
              kind: "text",
              html: "<p><strong>眼</strong>，是被己方棋子围住的空点。真眼像一口井，对方不敢也不能直接填进来。</p>",
            },
            {
              kind: "board",
              stones: ["B:C4", "B:D3", "B:E4", "B:D5"],
              next: "B",
              markers: ["D4"],
              note: "D4 是黑棋的一个眼：上下左右四个点都是黑棋。",
            },
            {
              kind: "text",
              html: "<p>那么<strong>假眼</strong>是什么？先不用管后面的“活棋”，只记一件事：围成眼的棋子如果连接不牢，这个眼就会被对方破掉。</p><p>所谓<strong>连接不牢</strong>，就是围住这个空的某颗棋子，自己气很少，和旁边棋子的联系也弱。对方可以先打吃这颗子——你如果去接，眼就被他趁机填掉；你如果不接，这颗子被提掉，眼同样没了。这样的眼就是<strong>假眼</strong>。</p>",
            },
          ],
        },
        {
          id: "ch2-2",
          type: "lesson",
          title: "两眼活棋",
          intro: "一块棋有两个真眼，就永远不会被提掉。",
          sections: [
            {
              kind: "text",
              html: "<p>围棋里最重要的结论之一：<strong>一块棋只要有两个真眼，就是活棋</strong>。因为对方每次只能下一手，无法同时填掉两个眼。</p>",
            },
            {
              kind: "board",
              stones: ["B:C3", "B:D3", "B:E3", "B:F3", "B:G3", "B:C4", "B:E4", "B:G4", "B:C5", "B:D5", "B:E5", "B:F5", "B:G5"],
              next: "B",
              markers: ["D4", "F4"],
              note: "黑棋有 D4 和 F4 两个眼。白棋无法同时填两个眼，因此黑棋活棋。",
            },
          ],
        },
        {
          id: "ch2-3",
          type: "lesson",
          title: "常见死活形",
          intro: "记住几个基本形，能省很多计算。",
          sections: [
            {
              kind: "text",
              html: "<p><strong>直三、曲三</strong>：中间一点是生死要点。谁先占到中间点，谁决定死活。</p><p><strong>丁四、刀把五、梅花五</strong>：同样是“点中间”，黑先补活，白先点杀。</p><p><strong>板六</strong>：通常是活形。</p>",
            },
            {
              kind: "board",
              stones: ["B:C3", "B:D3", "B:E3", "B:F3", "B:G3", "B:C4", "B:G4", "B:C5", "B:D5", "B:E5", "B:F5", "B:G5"],
              next: "B",
              markers: ["E4"],
              note: "D4、E4、F4 组成直三。黑棋补 E4 可活；若被白棋占 E4，则黑棋是死形。",
            },
          ],
        },
        {
          id: "ch2-quiz",
          type: "quiz",
          title: "第二章小测",
          intro: "看看你对死活的理解。",
          questions: [
            {
              q: "一块棋要有几个真眼才能活？",
              options: ["一个", "两个", "三个", "四个"],
              answer: 1,
              explain: "两个真眼让对手无法同时填掉，是活棋的基本条件。",
            },
            {
              q: "下列哪种形状通常需要“点中间”决定死活？",
              options: ["板六", "直四", "直三", "曲四"],
              answer: 2,
              explain: "直三和曲三的中间点是生死要点。",
            },
            {
              q: "假眼和真眼的关键区别是？",
              options: ["大小不同", "颜色不同", "假眼会被打吃后填掉，真眼不会", "位置不同"],
              answer: 2,
              explain: "假眼的连接不牢，对方可以通过打吃破坏。",
            },
            {
              q: "黑棋围出的空里有 D4、E4、F4 三个点（直三），黑先做活应下哪里？",
              options: ["D4", "E4", "F4", "天元"],
              answer: 1,
              explain: "中间点 E4 一手形成两个眼。",
            },
          ],
        },
        {
          id: "ch2-p1",
          type: "puzzle",
          title: "黑先：做活",
          intro: "黑棋围出了直三，请找到做活的关键点。",
          board: {
            stones: ["B:C3", "B:D3", "B:E3", "B:F3", "B:G3", "B:C4", "B:G4", "B:C5", "B:D5", "B:E5", "B:F5", "B:G5"],
            next: "B",
            markers: ["D4", "E4", "F4"],
          },
          answer: ["E4"],
          explanation: "黑棋补在中间的 E4，立刻形成 D4 和 F4 两个眼，活棋。",
        },
      ],
    },
    {
      id: "ch3",
      title: "布局基础：先占角、再占边",
      subtitle: "开局不是乱下，讲究先大后小。",
      items: [
        {
          id: "ch3-1",
          type: "lesson",
          title: "金角银边草肚皮",
          intro: "同样围空，角上的效率最高。",
          sections: [
            {
              kind: "text",
              html: "<p>围住同样多的地盘，<strong>角上需要的棋子最少，边上其次，中腹最多</strong>。所以开局要先占角，再占边，最后才到中腹。</p>",
            },
            {
              kind: "board",
              stones: ["B:D4"],
              next: "B",
              markers: ["D4", "D10", "K10"],
              note: "角上的 D4 很容易围空；边上的 D10 其次；中腹的 K10 最难围住。",
            },
          ],
        },
        {
          id: "ch3-2",
          type: "lesson",
          title: "守角、挂角与拆边",
          intro: "占角之后，棋局围绕角地展开。",
          sections: [
            {
              kind: "text",
              html: "<p><strong>占角</strong>：先在角上下子，常见有星位、小目、三三等。</p><p><strong>挂角</strong>：靠近对方已占的角下子，抢对方的角地。</p><p><strong>守角</strong>：在自己占的角附近补一手，巩固角地。</p><p><strong>拆边</strong>：在边上拆出一段根据地。</p>",
            },
            {
              kind: "sequence",
              initial: { stones: [], next: "B" },
              steps: [
                { move: "B:D4", note: "黑 1 占星位角。" },
                { move: "W:F3", note: "白 2 小飞挂角，靠近黑角。" },
                { move: "B:D6", note: "黑 3 一间跳守角，保护角地。" },
                { move: "W:C10", note: "白 4 在边上拆，建立根据地。" },
              ],
              note: "点“下一手”看看占角、挂角、守角、拆边的样子。",
            },
          ],
        },
        {
          id: "ch3-3",
          type: "lesson",
          title: "大场与急所",
          intro: "每步棋都要问自己：哪里最大、哪里最急？",
          sections: [
            {
              kind: "text",
              html: "<p><strong>大场</strong>：价值大、能围住很多空的点，通常是空旷的边角。</p><p><strong>急所</strong>：关系到某块棋的根据地或棋形安危的要点。急所常常比看起来“大”的地方更急。</p><p>原则：<strong>先急后大</strong>，先照顾自己的弱棋和对方强棋的弱点。</p>",
            },
          ],
        },
        {
          id: "ch3-quiz",
          type: "quiz",
          title: "第三章小测",
          intro: "检查布局感觉。",
          questions: [
            {
              q: "“金角银边草肚皮”的意思是？",
              options: ["角价值最高，中腹最低", "边价值最高", "中腹价值最高", "哪里都一样"],
              answer: 0,
              explain: "角上围空效率最高，中腹最低。",
            },
            {
              q: "开局通常应该先下哪里？",
              options: ["中腹", "角", "边", "天元"],
              answer: 1,
              explain: "先占角是高效的开局原则。",
            },
            {
              q: "“挂角”是什么意思？",
              options: ["在对方角附近下子抢角地", "在自己角上补一手", "在棋盘边缘下子", "提掉对方棋子"],
              answer: 0,
              explain: "挂角是靠近对方占角的一手，争夺角地。",
            },
            {
              q: "急所通常指什么？",
              options: ["无关紧要的地方", "关系到棋形和根据地的要点", "天元", "最边上的点"],
              answer: 1,
              explain: "急所是关系到死活和根据地的关键点。",
            },
          ],
        },
      ],
    },
    {
      id: "ch4",
      title: "基本手筋：吃子的巧劲",
      subtitle: "手筋，是用巧劲赢棋的小技巧。",
      items: [
        {
          id: "ch4-1",
          type: "lesson",
          title: "征子（扭羊头）",
          intro: "连续打吃，让对手无路可逃。",
          sections: [
            {
              kind: "text",
              html: "<p><strong>征子</strong>也叫“扭羊头”：连续打吃对方棋子，使对方每次逃跑后仍然只有两口气，最终被追到棋盘边缘吃掉。</p><p>使用征子前，要看清逃跑路线上有没有对方的接应子。有接应，征子就可能失败。</p>",
            },
            {
              kind: "board",
              stones: ["W:D4", "B:C4", "B:D3"],
              next: "B",
              markers: ["D5", "E4"],
              note: "示意：黑棋从 D5 方向打吃，白棋只能朝 E4 方向逃，黑棋再继续“堵头”追吃。",
            },
          ],
        },
        {
          id: "ch4-2",
          type: "lesson",
          title: "枷吃与闷吃",
          intro: "不直接紧气，而是把对方“罩”住。",
          sections: [
            {
              kind: "text",
              html: "<p><strong>枷吃</strong>：用虚罩的方法封住对方逃跑的路线，让对方的子像被网住一样逃不出去。</p><p><strong>闷吃</strong>：利用对方气紧的弱点，让对方连逃跑都没有足够的气。</p>",
            },
          ],
        },
        {
          id: "ch4-3",
          type: "lesson",
          title: "扑、倒扑与接不归",
          intro: "先送一子，反而吃得更多。",
          sections: [
            {
              kind: "text",
              html: "<p><strong>扑</strong>：主动把一颗子送到对方虎口里，让对方提掉，从而让对方的气变得更紧。</p><p><strong>倒扑</strong>：对方提掉你的子之后，你马上反提回更多棋子。</p><p><strong>接不归</strong>：对方因为气太紧，接不回去，眼睁睁被吃。</p>",
            },
          ],
        },
        {
          id: "ch4-quiz",
          type: "quiz",
          title: "第四章小测",
          intro: "手筋的名字和用途要分清。",
          questions: [
            {
              q: "“征子”又叫什么？",
              options: ["扭羊头", "双打吃", "倒扑", "金鸡独立"],
              answer: 0,
              explain: "征子俗称扭羊头，连续追吃对方。",
            },
            {
              q: "“倒扑”的意思是？",
              options: ["先送一子，对方提后反提更多", "连续打吃", "把棋子倒过来放", "吃掉自己"],
              answer: 0,
              explain: "倒扑是先弃后取，反提更多棋子的手筋。",
            },
            {
              q: "“双打吃”能同时怎样？",
              options: ["打吃两块棋", "提掉自己", "围住中腹", "结束棋局"],
              answer: 0,
              explain: "双打吃同时让两块棋陷入被打吃的局面。",
            },
            {
              q: "使用征子前，最重要的是看清什么？",
              options: ["逃跑路线上的接应子", "棋盘颜色", "自己的心情", "对方是否说话"],
              answer: 0,
              explain: "逃跑路线上有对方接应子，征子就会失败。",
            },
          ],
        },
        {
          id: "ch4-p1",
          type: "puzzle",
          title: "黑先：双打吃",
          intro: "找到同时打吃两块白棋的那一手。",
          board: { stones: ["B:D4", "B:D6", "B:F4", "B:F6", "W:D5", "W:F5"], next: "B" },
          answer: ["E5"],
          explanation: "黑棋下 E5，同时打吃 D5 和 F5 两处白棋，白棋无法两全。",
        },
      ],
    },
    {
      id: "ch5",
      title: "官子入门：把优势变成胜利",
      subtitle: "收官阶段，每一目都很值钱。",
      items: [
        {
          id: "ch5-1",
          type: "lesson",
          title: "先手官子与后手官子",
          intro: "官子也要分先后。",
          sections: [
            {
              kind: "text",
              html: "<p><strong>先手官子</strong>：你走完对方必须应，否则会损失更大；你还能接着在别处下。</p><p><strong>后手官子</strong>：走完对方可以不应，轮到对方到别处下。</p><p>一般情况下，先手官子更宝贵，因为它是“白赚”的。</p>",
            },
          ],
        },
        {
          id: "ch5-2",
          type: "lesson",
          title: "官子价值与常见官子形",
          intro: "用“目”来衡量一手棋的价值。",
          sections: [
            {
              kind: "text",
              html: "<p>官子的价值，通常用<strong>目</strong>来计算：这手棋能为己方增加多少目，或让对手减少多少目。</p><p>收官顺序：先收双方必抢的大官子，再收先手官子，最后收后手官子。</p>",
            },
          ],
        },
        {
          id: "ch5-quiz",
          type: "quiz",
          title: "第五章小测",
          intro: "官子基础问答。",
          questions: [
            {
              q: "先手官子和后手官子，通常哪个更宝贵？",
              options: ["先手官子", "后手官子", "一样", "都不重要"],
              answer: 0,
              explain: "先手官子相当于免费赚到，通常更宝贵。",
            },
            {
              q: "官子的价值一般用什么单位衡量？",
              options: ["目", "厘米", "秒", "分"],
              answer: 0,
              explain: "围棋用“目”衡量空的大小。",
            },
            {
              q: "收官时一般先收什么？",
              options: ["大官子", "最小的后手官子", "任意位置", "天元"],
              answer: 0,
              explain: "先收价值大的官子，避免被对方抢走。",
            },
          ],
        },
      ],
    },
    {
      id: "ch6",
      title: "攻防思路：厚势、连接与攻击",
      subtitle: "从“吃子”到“下棋”，开始建立全局观。",
      items: [
        {
          id: "ch6-1",
          type: "lesson",
          title: "厚势与实利",
          intro: "有的棋值钱在眼前，有的棋值钱在未来。",
          sections: [
            {
              kind: "text",
              html: "<p><strong>实利</strong>：已经确定拿到的目，是“现钱”。</p><p><strong>厚势</strong>：向外发展的强大力量，是“投资”。厚势用好了能围出更大的空，用不好就是一块没有回报的死肉。</p><p>原则：<strong>取实利别怕对方厚，取厚势别浪费。</strong></p>",
            },
          ],
        },
        {
          id: "ch6-2",
          type: "lesson",
          title: "连接与切断",
          intro: "棋子的力量在于连接。",
          sections: [
            {
              kind: "text",
              html: "<p><strong>连接</strong>：让己方棋子连成一块，气变多，更安全。</p><p><strong>切断</strong>：把对方分成两块，让它们各自为战，容易被攻击。</p><p>一盘棋里，很多战斗的起因就是“分断”。先想清楚：这手棋是在连接自己，还是在切断对方？</p>",
            },
          ],
        },
        {
          id: "ch6-3",
          type: "lesson",
          title: "打入与侵消",
          intro: "对方的地盘太大，就要想办法破坏。",
          sections: [
            {
              kind: "text",
              html: "<p><strong>打入</strong>：深入到对方阵势内部，直接破坏对方的空，风险大、收获也可能大。</p><p><strong>侵消</strong>：从外围压缩对方，降低对方的成空规模，风险较小。</p><p>自己落后时，要主动打入或侵消；自己领先时，要稳健补棋，不给对方机会。</p>",
            },
          ],
        },
        {
          id: "ch6-4",
          type: "lesson",
          title: "攻击的节奏与腾挪",
          intro: "攻击不是拼命，而是让对手难受。",
          sections: [
            {
              kind: "text",
              html: "<p><strong>攻击的节奏</strong>：不要只想吃棋，而是通过攻击获取利益——一边攻击一边围空、补强自己。</p><p><strong>腾挪</strong>：当自己棋形不利时，用灵活的手段摆脱困境，常常需要弃子换取转身。</p>",
            },
          ],
        },
        {
          id: "ch6-quiz",
          type: "quiz",
          title: "第六章小测",
          intro: "建立全局观。",
          questions: [
            {
              q: "“实利”指的是什么？",
              options: ["已经确定的目", "未来的潜力", "棋子的颜色", "棋盘的大小"],
              answer: 0,
              explain: "实利是眼前已经拿到手的目。",
            },
            {
              q: "切断对方的目的是什么？",
              options: ["把对方分成两块，制造弱点", "帮对方连接", "围自己的空", "数棋"],
              answer: 0,
              explain: "切断使对方变弱，方便后续攻击。",
            },
            {
              q: "“打入”和“侵消”的区别是？",
              options: ["打入深入内部，侵消从外围压缩", "完全一样", "打入只在中腹", "侵消只在角上"],
              answer: 0,
              explain: "打入深入破坏，侵消外围压缩，风险不同。",
            },
            {
              q: "攻击对方时，最重要的目标是？",
              options: ["一定要提掉所有子", "通过攻击获得利益", "把棋盘填满", "迅速认输"],
              answer: 1,
              explain: "攻击的最终目的是获取利益，而不是盲目吃棋。",
            },
          ],
        },
      ],
    },
    {
      id: "ch7",
      title: "实战对局与复盘",
      subtitle: "把学到的思路用到一盘完整的棋里。",
      items: [
        {
          id: "ch7-1",
          type: "lesson",
          title: "一盘棋的节奏",
          intro: "布局、中盘、官子，各阶段任务不同。",
          sections: [
            {
              kind: "text",
              html: "<p><strong>布局</strong>：抢占大场，建立根据地，速度快。</p><p><strong>中盘</strong>：围绕弱棋和厚薄展开攻防，是决定胜负的核心阶段。</p><p><strong>官子</strong>：把边界最后确定下来，每一目都算清楚。</p><p>记住：<strong>布局求快，中盘求势，官子求细。</strong></p>",
            },
          ],
        },
        {
          id: "ch7-2",
          type: "lesson",
          title: "复盘方法",
          intro: "下完棋，比下棋更重要。",
          sections: [
            {
              kind: "text",
              html: "<p>下完一局，问自己三个问题：</p><p>1. 哪一手开始让我变被动？</p><p>2. 对方哪块棋很强，我为什么没有处理？</p><p>3. 如果重来，我最想改哪一手？</p><p>复盘比多下几盘更能涨棋。</p>",
            },
          ],
        },
        {
          id: "ch7-play",
          type: "play",
          title: "人机对战练习",
          intro: "和入门 AI 下一盘 19 路棋。你可以执黑或执白，用“虚着”过渡，用“数棋”结束。",
        },
      ],
    },
  ];

  window.GO_DATA = { chapters };
})();
