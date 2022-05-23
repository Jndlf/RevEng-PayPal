# disable implicit rules
.SUFFIXES:

DOCUMENT := talk

.PHONY: document clean

document:
	@echo "Build document"
	latexmk -pdf -bibtex $(DOCUMENT)

clean:
	@ echo 'Clean up'
	latexmk -C
	rm -f pdfa.xmpi
	rm -f $(DOCUMENT)-blx.bib
