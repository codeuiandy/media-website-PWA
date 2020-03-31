(function() {
    let currentPageIndex = 0;
    let pageMode = 1;
    let cursorIndex = Math.floor(currentPageIndex / pageMode);
    let pdfInstance = null;
    let totalPagesCount = 0;
  
    const viewport = document.querySelector("#viewport");
    window.initPDFViewer = function(pdfURL) {
      pdfjsLib.getDocument(pdfURL).then(pdf => {
        pdfInstance = pdf;
        totalPagesCount = pdf.numPages;
        initPager();
        initPageMode();
        render();
      });
    };
  
    function onPagerButtonsClick(event) {
      const action = event.target.getAttribute("data-pager");
      if (action === "prev") {
        if (currentPageIndex === 0) {
          return;
        }
        currentPageIndex -= pageMode;
        if (currentPageIndex < 0) {
          currentPageIndex = 0;
        }
        render();
      }
      if (action === "next") {
        if (currentPageIndex === totalPagesCount - 1) {
          return;
        }
        currentPageIndex += pageMode;
        if (currentPageIndex > totalPagesCount - 1) {
          currentPageIndex = totalPagesCount - 1;
        }
        render();
      }
    }
    function initPager() {
      const pager = document.querySelector("#pager");
      pager.addEventListener("click", onPagerButtonsClick);
      return () => {
        pager.removeEventListener("click", onPagerButtonsClick);
      };
    }
  
    function onPageModeChange(event) {
      pageMode = Number(event.target.value);
      render();
    }
    function initPageMode() {
      const input = document.querySelector("#page-mode input");
      input.setAttribute("max", totalPagesCount);
      input.addEventListener("change", onPageModeChange);
      return () => {
        input.removeEventListener("change", onPageModeChange);
      };
    }
  
    function render() {
      cursorIndex = Math.floor(currentPageIndex / pageMode);
      const startPageIndex = cursorIndex * pageMode;
      const endPageIndex =
        startPageIndex + pageMode < totalPagesCount
          ? startPageIndex + pageMode - 1
          : totalPagesCount - 1;
  
      const renderPagesPromises = [];
      for (let i = startPageIndex; i <= endPageIndex; i++) {
        renderPagesPromises.push(pdfInstance.getPage(i + 1));
      }
  
      Promise.all(renderPagesPromises).then(pages => {
        const pagesHTML = `<div style="width: ${
          pageMode > 1 ? "50%" : "100%"
        }"><canvas></canvas></div>`.repeat(pages.length);
        viewport.innerHTML = pagesHTML;
        pages.forEach(renderPage);
      });
    }
  
    function renderPage(page) {
      let pdfViewport = page.getViewport(1);
  
      const container =
        viewport.children[page.pageIndex - cursorIndex * pageMode];
      pdfViewport = page.getViewport(container.offsetWidth / pdfViewport.width);
      const canvas = container.children[0];
      const context = canvas.getContext("2d");
      canvas.height = pdfViewport.height;
      canvas.width = pdfViewport.width;
  
      page.render({
        canvasContext: context,
        viewport: pdfViewport
      });
    }
  })();

let pinchZoomEnabled = false;
function enablePinchZoom(pdfViewer) {
    let startX = 0, startY = 0;
    let initialPinchDistance = 0;        
    let pinchScale = 1;    
    const viewer = document.getElementById("viewport");
    const container = document.getElementById("viewport-container");
    const reset = () => { startX = startY = initialPinchDistance = 0; pinchScale = 1; };
    // Prevent native iOS page zoom
    //document.addEventListener("touchmove", (e) => { if (e.scale !== 1) { e.preventDefault(); } }, { passive: false });
    document.addEventListener("touchstart", (e) => {
        if (e.touches.length > 1) {
            startX = (e.touches[0].pageX + e.touches[1].pageX) / 2;
            startY = (e.touches[0].pageY + e.touches[1].pageY) / 2;
            initialPinchDistance = Math.hypot((e.touches[1].pageX - e.touches[0].pageX), (e.touches[1].pageY - e.touches[0].pageY));
        } else {
            initialPinchDistance = 0;
        }
    });
    document.addEventListener("touchmove", (e) => {
        if (initialPinchDistance <= 0 || e.touches.length < 2) { return; }
        if (e.scale !== 1) { e.preventDefault(); }
        const pinchDistance = Math.hypot((e.touches[1].pageX - e.touches[0].pageX), (e.touches[1].pageY - e.touches[0].pageY));
        const originX = startX + container.scrollLeft;
        const originY = startY + container.scrollTop;
        pinchScale = pinchDistance / initialPinchDistance;
        viewer.style.transform = `scale(${pinchScale})`;
        viewer.style.transformOrigin = `${originX}px ${originY}px`;
    }, { passive: false });
    document.addEventListener("touchend", (e) => {
        if (initialPinchDistance <= 0) { return; }
        viewer.style.transform = `none`;
        viewer.style.transformOrigin = `unset`;
        PDFViewerApplication.pdfViewer.currentScale *= pinchScale;
        const rect = container.getBoundingClientRect();
        const dx = startX - rect.left;
        const dy = startY - rect.top;
        container.scrollLeft += dx * (pinchScale - 1);
        container.scrollTop += dy * (pinchScale - 1);
        reset();
    });
}
document.addEventListener('webviewerloaded', () => {
    if (!pinchZoomEnabled) {
        pinchZoomEnabled = true;
        enablePinchZoom();
    }
});