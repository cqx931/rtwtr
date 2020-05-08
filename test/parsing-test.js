// Definitions
const CLAUSE_BREAKS = ["_,_", "_;_", "_:_", "</cb>"];
const THOUGHT_BREAKS = ["_._", "_?_", "_!_", "</tb>"]; // Done
const PARAGRAPH_BREAK = "<pb/>"; // Done
const SECTION_BREAK = "<sb/>"; // Done
const UNIT_PAIRS = ["<ub>","</ub>"];// Done

const DEFAULT_PATH = ".tb:last";

// Typography
const TEXT_SIZE = 22, LINE_HEIGHT = 30;
// Layout
const CONTENT_WIDTH = 800, MARGIN_LEFT = 200;

// Tools

const Tester = {
  dom: document.getElementById("getTextWidth"),
  end:"."
};

function calculateTextLength(text) {
  Tester.dom.innerText = text + Tester.end;
  return Tester.dom.clientWidth - Tester.trim;
}

function getChildrenBefore(children, key) {
  if (typeof key == "number") {
    return children.slice(0, key);
  } else if (typeof key == "string") {
    for (var i = 0; i < children.length; i++) {
      if (key[0] == "#" && children[i].id == key.replace("#","")) {
        return children.slice(0, i);
      }
    }
  }
}

function getChildrenAfter(children, key) {
  if (typeof key == "number") {
    return children.slice(key+1, children.length);
  } else if (typeof key == "string") {
    for (var i = 0; i < children.length; i++) {
      if (key[0] == "#" && children[i].id == key.replace("#","")) {
        return children.slice(i+1, children.length);
      }
    }
  }
}

function endsWithAny(str, array){
  for (let i = 0; i < array.length; i++) {
    const word = array[i];
    if (str.endsWith(word)) return true;
  }
  return false;
}

function wordCount(str) {
  return str.trim().split(/\s+/).length;
}

// End of Tools

function readTextFile(file, callback)
{
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                var allText = rawFile.responseText;
                callback(allText)
            }
        }
    }
    rawFile.send(null);
}


// Parsing Section
function removeGitDiffSyntags(content) {
  return content.replace(/(^-|^\+|_)/g,"");
}

function removeBreaks(content) {
  return content.replace(/(<ub>|<\/ub>|<sb\/>|<pb\/>)/g,"");
}

function removeEmptyElements(selector) {
  // remove redundant
  $(selector).each(function() {
     if( $(this)[0].innerHTML == "")  $(this)[0].remove();
  });
}

function getCurrentIndexInDirectParent(dom) {
  const children = dom.parent().children();
  for (var i = 0; i < children.length; i++) {
    if (children[i] == dom[0]) return i;
  }
  return false;
}

function linguisticParsing(content){
  // might not need this
  const elements = content.split(/\s+/);
  let parsedContent = "";
  for (var i = 0; i < elements.length; i++) {
    // if (elements[i] = ) {
      parsedContent += "<span class='min'>" + elements[i] + "</span>"
    // }
  }
  //console.log(parsedContent);
  return content;
}

function parseText(data) {
  const lines = data.split("\n");
  // skip the top section
  lines.splice(0, 5);
  let contentToBeAppend = document.createElement('div');
  $(contentToBeAppend).attr("id", "content");

  let currentPage = 1, currentNo = 0, match = false;

  createNewPage(currentPage, contentToBeAppend);

  for (var i = 0; i < lines.length; i++) {

    const line = lines[i].substr(1),
          type = lines[i][0];
    let content = lines[i],
        newSpan =  document.createElement("span");

    // clean up syntags

    content = removeGitDiffSyntags(content);
    content = removeBreaks(content);
    // fix space after & before punctuatiion
    content = content.replace(/([,;:.\?!])$/g,"$1 ");
    content = content.replace(/^ ([,;:.\?!])/g,"$1");
    // content =
    newSpan.innerText = content;

    const currentAdiv = $(contentToBeAppend).find('#page' + currentPage +' .adiv'),
          currentBdiv =  $(contentToBeAppend).find('#page' + currentPage +' .bdiv');

    switch(type) {
      case "-":
         newSpan.id = "a" + currentNo;
         match = true;
         newSpan.classList += " hide";
         // hide = append a span (.hide)
         content != "" && currentAdiv.find(DEFAULT_PATH).append(newSpan);
        break;
      case " ":
          if (match == true) currentNo++;
          match = false;
          if (line == SECTION_BREAK) {
            // Handle section breaks
            currentPage ++;
            createNewPage(currentPage, contentToBeAppend);
          } else if (line == PARAGRAPH_BREAK) {
            // Handle paragraph breaks
            currentAdiv.append("<p></p>");
            currentBdiv.append("<p></p>");
          } else if (UNIT_PAIRS.indexOf(line) > -1) {
            // Handle unit
            if (line == UNIT_PAIRS[0]) {
              const unit = "<span class='unit manual'><span class='tb'></span></span>";
              currentAdiv.find("p:last").append(unit);
              currentBdiv.find("p:last").append(unit);
            } else {
              const tb = "<span class='tb'></span>";
              currentAdiv.find("p:last").append(tb);
              currentBdiv.find("p:last").append(tb);
            }

          } else {
            // shared  = append to both a span & b span
            newSpan.classList += " shared";
            newSpan.id = "a" + currentNo;
            if (content != "") {
              currentAdiv.find(DEFAULT_PATH).append(newSpan);
              const clone = newSpan.cloneNode(true);
              clone.id = "b" + currentNo;
              currentBdiv.find(DEFAULT_PATH).append(clone);
            }
            currentNo ++;
          }
        break;
      case "+":
          newSpan.id = "b" + currentNo;
          match = false;
          currentNo++;
          // add = append b span (display:none)
          content != "" && currentBdiv.find(DEFAULT_PATH).append(newSpan);
        break;
      case "~":
        // new line : no visual representation in the html
        if (match == true) currentNo++;
        match = false;
        break;
      default :
        //console.log("[Warning] Unparsable line", line);
    } // End of Switch

    // Handle THOUGHT_BREAKS
    if(endsWithAny(line, THOUGHT_BREAKS)) {
      const tb = "<span class='tb'></span>";
      currentAdiv.find(".tb:last").parent().append(tb);
      currentBdiv.find(".tb:last").parent().append(tb);
    }

  } // End of for loop

  // append content
  $('body').append(contentToBeAppend);
  initTester();
  removeEmptyElements('.tb')
  // set current page
  $('#page1').addClass('current')

  // user interaction
  $('.adiv > p > span').mouseover(function() {
    const spanIdx = getCurrentIndexInDirectParent($(this));
    const pIdx = getCurrentIndexInDirectParent($(this).parent());
    const currentPage = $(this).parent().parent().parent();

    const bspan = currentPage.find('.bdiv').children().eq(pIdx).children().eq(spanIdx);
    $('.bdiv p > span').css("opacity","0");
    anime(bspan, $(this));

  //  bspan.css("opacity","0.8");

  })

  $('.adiv > p > span').mouseout(function() {
    $('.bdiv p > span').css("opacity","0");
  })


  // menu
  $('.menu li').click(function() {
    console.log(this.innerText)
    $('.page').removeClass('current')
    $('#page'+ this.innerText).addClass('current')
  })

}
// End of Parsing Section

// Visualization Section
function createNewPage(index, wrapper) {
  const page = $('#template .page').clone()[0];
  page.id = "page" + index;
  $(wrapper).append(page);
  // populate menu
  $('.menu ul').append("<li>"+ index + "</li>");
}


function basicAnalyze(aspan, bspan, mousePosition) {
  const dbug = 0;
  // if no mouse position is provided, default reference point is the center
  const ref = {
    x:mousePosition ? mousePosition.x : aspan.width()/2,
    y:mousePosition ? mousePosition.y : aspan.height()/2 + aspan[0].offsetTop - TEXT_SIZE
  }
  dbug && console.log("Reference point:", ref);
  let report = new contextReport(aspan, bspan, ref);
  console.log(report);

  // const a_space = calculateLengthBeforeAfter(aspan, tmpIdx),
  //       b_space = calculateLengthBeforeAfter(bspan, tmpIdx);
  //
  // const d = {
  //   before: a_space.before - b_space.before,
  //   after: a_space.after - b_space.after
  // }
  //
  // dbug && console.log(a_space, b_space);
  //
  // // adjust anchor if space is not enough
  // if (d.before < 0 && d.after > 0) {
  //   dbug && console.log("adjust +")
  //   which ++
  // } else if(d.after < 0 && d.before > 0) {
  //   dbug && console.log("adjust -", d.after)
  //   which --;
  // }
  //
  // return sharedSpans[which].id;
}

// function getAnchorIndex(aspan, bspan) {
//   const sharedInB = bspan.find('.shared'),
//         sharedInA = aspan.find('.shared');
//   if (sharedInB.length == sharedInA.length) {
//     return parseInt(getAnchorId(aspan,bspan).replace(/[a-zA-Z ]/g,""));
//     // closest
//   } else {
//     console.log("Error: The number of shared span doesn't match", sharedInA.length, sharedInB.length)
//   }
//
// }

function calculateTotalTextLength(spans) {
  let total = 0;

  for (var i = 0; i < spans.length; i++) {
    if (spans[i].innerText == undefined) {
      console.log("Error! Can't retrieve innerText.")
    } else {
      total += calculateTextLength(spans[i].innerText);
    }
  }
  //console.log(total);
  return total;
}

function getAllContent(spans) {
  let all = "";

  for (var i = 0; i < spans.length; i++) {
    if (spans[i].innerText == undefined) {
      console.log("Error! Can't retrieve innerText.")
    } else {
      all += spans[i].innerText;
    }
  }
  return all;
}

function initTester(){
  Tester.dom.innerText = Tester.end;
  Tester.trim = Tester.dom.clientWidth;
}

function anime(bspan, aspan) {

  let context = basicAnalyze(aspan, bspan);

  // const anchor = aspan.find("#a" + anchorIdx);
  // anchor.addClass("anchor");
  //
  // //$('#anchor').offset(anchor.offset());
  // $('#anchor').text(anchor.text());
  //
  // console.log(anchor.offset(), anchor.text(), anchorIdx);
  //
  // const childrenAfter = getChildrenAfter(bspan.find('span:not(.tb)'), "#b" + anchorIdx);
  // const childrenBefore = getChildrenBefore(bspan.find('span:not(.tb)'), "#b" + anchorIdx);
  //
  // let contentAfter = "", contentBefore = "";
  //
  // for (var i = 0; i < childrenBefore.length; i++) {
  //   contentBefore += childrenBefore[i].innerText
  // }
  // for (var i = 0; i < childrenAfter.length; i++) {
  //   contentAfter += childrenAfter[i].innerText
  // }
  //
  // let afterOffset = {
  //    top: anchor.offset().top,
  //    // left: anchor.offset().left + anchor.width()
  //  }
  // console.log(contentBefore, calculateTextLength(contentBefore))
  // // calculate indent based a new b_difference
  // const indent = getIndent(calculateTextLength(contentBefore), CONTENT_WIDTH);
  //
  // $('#beforeAnchor').text(contentBefore);
  //
  // document.getElementById("hover").style.textIndent = indent+ "px";
  //$('#beforeAnchor').offset(aspan.offset());
  // $('#afterAnchor').text(contentAfter);
  // $('#afterAnchor').offset(afterOffset);

  //repositionBspan(bspan, aspan, anchorIdx);
}

function getIndent(total, unit) {
  while (total > unit) {
    total -= unit;
  }
  return total;
}

function repositionBspan(bspan, aspan, idx) {

  const b_anchor = bspan.find("#b"+idx),
  a_anchor = aspan.find("#a"+idx);
  b_anchor.addClass("anchor");

  b_anchor.offset(a_anchor.offset());
  const childrenAfter = getChildrenAfter(bspan.find('span:not(.tb)'), "#b"+idx);
  const childrenBefore = getChildrenBefore(bspan.find('span:not(.tb)'), "#b"+idx);

  let contentAfter = "", contentBefore = "";
  for (var i = 0; i < childrenAfter.length; i++) {
    contentAfter += childrenAfter[i].innerText
  }
  for (var i = 0; i < childrenBefore.length; i++) {
    contentBefore += childrenBefore[i].innerText
  }
  console.log(contentBefore, contentAfter)

  let afterOffset = {
     top: b_anchor.offset().top,
     left: b_anchor.offset().left + b_anchor.width()
   }

  $('#afterAnchor').text(contentAfter);
  $('#afterAnchor').offset(afterOffset);
  $('#beforeAnchor').text(intend_before + contentBefore);
  $('#beforeAnchor').offset(aspan.offset());


  // reposition everything after anchor
  // for (var i = 0; i < childrenAfter.length; i++) {
  //   const c = childrenAfter[i], w = calculateTextLength(c);;
  //
  //   let newOffset = {
  //     top: b_anchor.offset().top,
  //     left: b_anchor.offset().left + record
  //   }
  //
  //   console.log(newOffset, b_anchor.offset(), c.innerText, newOffset.left);
  //   if (newOffset.left + w > CONTENT_WIDTH + MARGIN_LEFT) {
  //     // line break
  //     const numberOfWords = wordCount(c.innerText);
  //     if (numberOfWords == 1) {
  //       newOffset.left -= CONTENT_WIDTH ;
  //       newOffset.top += LINE_HEIGHT;
  //     } else {
  //       // c.innerText = c.innerText.split(" ")[0] + "\n";
  //       // TODO: try line break within the span;
  //     }
  //
  //   }
  //   $(c).offset(newOffset);
  //   record += w
  //
  //   if(i== 5) break;
  // }

}

// End of Visualization Section

readTextFile("../data/ab_worddiff.txt", parseText);
